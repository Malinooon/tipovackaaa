const axios = require('axios');
const Match = require('../models/Match');
const Prediction = require('../models/Prediction');
const League = require('../models/League');

// Funkce pro získání dat z TheSportsDB API
const fetchMatchesFromAPI = async () => {
  try {
    const apiKey = process.env.SPORTS_DB_API_KEY;
    const apiUrl = process.env.SPORTS_DB_API_URL;
    const seasonId = '2025'; // MS v hokeji 2025
    const leagueId = '4976'; // ID pro mezinárodní hokej

    const response = await axios.get(
      `${apiUrl}/${apiKey}/eventsseason.php?id=${leagueId}&s=${seasonId}`
    );

    if (!response.data || !response.data.events) {
      console.error('API nevrátila očekávaná data');
      return [];
    }

    return response.data.events;
  } catch (error) {
    console.error('Chyba při získávání dat z API:', error);
    return [];
  }
};

// Funkce pro aktualizaci výsledků zápasů z API
const updateMatchResults = async () => {
  try {
    const apiMatches = await fetchMatchesFromAPI();
    
    if (!apiMatches || apiMatches.length === 0) {
      console.log('Žádné zápasy nebyly nalezeny v API');
      return;
    }

    for (const apiMatch of apiMatches) {
      // Kontrola, zda je zápas dokončen
      if (apiMatch.strStatus !== 'Match Finished' && apiMatch.strStatus !== 'FT') {
        continue;
      }

      // Hledání zápasu v naší databázi
      const match = await Match.findOne({ matchId: apiMatch.idEvent });
      
      if (!match) {
        console.log(`Zápas s ID ${apiMatch.idEvent} nebyl nalezen v databázi`);
        continue;
      }

      // Kontrola, zda zápas nebyl manuálně aktualizován
      if (match.manuallyUpdated) {
        console.log(`Zápas s ID ${apiMatch.idEvent} byl manuálně aktualizován, přeskakuji`);
        continue;
      }

      // Parsování skóre
      const homeScore = parseInt(apiMatch.intHomeScore);
      const awayScore = parseInt(apiMatch.intAwayScore);
      
      if (isNaN(homeScore) || isNaN(awayScore)) {
        console.log(`Neplatné skóre pro zápas ${apiMatch.idEvent}`);
        continue;
      }

      // Určení typu ukončení zápasu (regular, overtime, shootout)
      let endingType = 'regular';
      if (apiMatch.strPostponed === 'yes' && apiMatch.strStatus.includes('AET')) {
        endingType = 'overtime';
      } else if (apiMatch.strPostponed === 'yes' && apiMatch.strStatus.includes('AP')) {
        endingType = 'shootout';
      }

      // Aktualizace výsledku zápasu
      match.result.homeScore = homeScore;
      match.result.awayScore = awayScore;
      match.result.endingType = endingType;
      match.result.isFinished = true;
      match.apiUpdatedAt = new Date();
      
      await match.save();
      
      // Vyhodnocení predikcí pro tento zápas
      await evaluatePredictions(match);
    }
    
    console.log('Aktualizace výsledků zápasů dokončena');
  } catch (error) {
    console.error('Chyba při aktualizaci výsledků zápasů:', error);
    throw error;
  }
};

// Funkce pro vyhodnocení predikcí pro daný zápas
const evaluatePredictions = async (match) => {
  try {
    // Získání všech predikcí pro daný zápas
    const predictions = await Prediction.find({ matchId: match._id, evaluated: false });
    
    if (predictions.length === 0) {
      console.log(`Žádné nevyhodnocené predikce pro zápas ${match._id}`);
      return;
    }

    for (const prediction of predictions) {
      // Získání ligy pro bodovací pravidla
      const league = await League.findById(prediction.leagueId);
      
      if (!league) {
        console.log(`Liga s ID ${prediction.leagueId} nebyla nalezena`);
        continue;
      }

      // Inicializace bodů a detailů vyhodnocení
      let points = 0;
      const evaluationDetails = {
        exactScore: false,
        correctWinner: false,
        correctScoreDifference: false,
        correctHomeGoals: false,
        correctAwayGoals: false,
        correctEndingType: false
      };

      // Vyhodnocení přesného výsledku
      if (prediction.homeScore === match.result.homeScore && 
          prediction.awayScore === match.result.awayScore) {
        evaluationDetails.exactScore = true;
        points += league.scoringRules.exactScore;
      }

      // Vyhodnocení správného vítěze
      const predictionWinner = prediction.homeScore > prediction.awayScore ? 'home' : 
                              prediction.homeScore < prediction.awayScore ? 'away' : 'draw';
      const matchWinner = match.result.homeScore > match.result.awayScore ? 'home' : 
                          match.result.homeScore < match.result.awayScore ? 'away' : 'draw';
      
      if (predictionWinner === matchWinner) {
        evaluationDetails.correctWinner = true;
        points += league.scoringRules.correctWinner;
      }

      // Vyhodnocení správného rozdílu ve skóre
      const predictionDiff = prediction.homeScore - prediction.awayScore;
      const matchDiff = match.result.homeScore - match.result.awayScore;
      
      if (predictionDiff === matchDiff) {
        evaluationDetails.correctScoreDifference = true;
        points += league.scoringRules.correctScoreDifference;
      }

      // Vyhodnocení správného počtu gólů domácího týmu
      if (prediction.homeScore === match.result.homeScore) {
        evaluationDetails.correctHomeGoals = true;
        points += league.scoringRules.correctHomeGoals;
      }

      // Vyhodnocení správného počtu gólů hostujícího týmu
      if (prediction.awayScore === match.result.awayScore) {
        evaluationDetails.correctAwayGoals = true;
        points += league.scoringRules.correctAwayGoals;
      }

      // Vyhodnocení správného typu ukončení zápasu
      if (prediction.endingType === match.result.endingType) {
        evaluationDetails.correctEndingType = true;
        points += league.scoringRules.correctEndingType;
      }

      // Aktualizace predikce
      prediction.points = points;
      prediction.evaluated = true;
      prediction.evaluationDetails = evaluationDetails;
      
      await prediction.save();

      // Aktualizace celkových bodů uživatele v lize
      await League.updateOne(
        { _id: prediction.leagueId, 'members.userId': prediction.userId },
        { $inc: { 'members.$.totalPoints': points } }
      );
    }
    
    console.log(`Vyhodnoceno ${predictions.length} predikcí pro zápas ${match._id}`);
  } catch (error) {
    console.error('Chyba při vyhodnocování predikcí:', error);
    throw error;
  }
};

module.exports = {
  fetchMatchesFromAPI,
  updateMatchResults,
  evaluatePredictions
};
