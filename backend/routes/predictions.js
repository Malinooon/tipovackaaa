const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const auth = require('../middleware/auth');

const Prediction = require('../models/Prediction');
const Match = require('../models/Match');
const League = require('../models/League');

// @route   POST api/predictions
// @desc    Vytvoření nebo aktualizace predikce
// @access  Private
router.post(
  '/',
  [
    auth,
    [
      check('matchId', 'ID zápasu je povinné').not().isEmpty(),
      check('leagueId', 'ID ligy je povinné').not().isEmpty(),
      check('homeScore', 'Skóre domácího týmu je povinné').isNumeric(),
      check('awayScore', 'Skóre hostujícího týmu je povinné').isNumeric(),
      check('endingType', 'Typ ukončení zápasu je povinný').isIn(['regular', 'overtime', 'shootout'])
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { matchId, leagueId, homeScore, awayScore, endingType } = req.body;

    try {
      // Kontrola, zda zápas existuje
      const match = await Match.findById(matchId);
      
      if (!match) {
        return res.status(404).json({ msg: 'Zápas nebyl nalezen' });
      }
      
      // Kontrola, zda liga existuje
      const league = await League.findById(leagueId);
      
      if (!league) {
        return res.status(404).json({ msg: 'Liga nebyla nalezena' });
      }
      
      // Kontrola, zda je uživatel členem ligy
      const isMember = league.members.some(
        member => member.userId.toString() === req.user.id
      );
      
      if (!isMember) {
        return res.status(403).json({ msg: 'Nejste členem této ligy' });
      }
      
      // Kontrola, zda již neuplynula uzávěrka tipů (30 minut před začátkem zápasu)
      const now = new Date();
      const deadline = new Date(match.startTime);
      deadline.setMinutes(deadline.getMinutes() - 30);
      
      if (now > deadline) {
        return res.status(400).json({ msg: 'Uzávěrka tipů pro tento zápas již uplynula' });
      }
      
      // Kontrola, zda již existuje predikce pro tento zápas, ligu a uživatele
      let prediction = await Prediction.findOne({
        userId: req.user.id,
        matchId,
        leagueId
      });
      
      if (prediction) {
        // Aktualizace existující predikce
        prediction.homeScore = homeScore;
        prediction.awayScore = awayScore;
        prediction.endingType = endingType;
        prediction.updatedAt = now;
      } else {
        // Vytvoření nové predikce
        prediction = new Prediction({
          userId: req.user.id,
          matchId,
          leagueId,
          homeScore,
          awayScore,
          endingType
        });
      }
      
      await prediction.save();
      
      res.json(prediction);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Chyba serveru');
    }
  }
);

// @route   GET api/predictions/user/league/:leagueId
// @desc    Získání všech predikcí uživatele v dané lize
// @access  Private
router.get('/user/league/:leagueId', auth, async (req, res) => {
  try {
    const predictions = await Prediction.find({
      userId: req.user.id,
      leagueId: req.params.leagueId
    }).populate('matchId');
    
    res.json(predictions);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Chyba serveru');
  }
});

// @route   GET api/predictions/match/:matchId/league/:leagueId
// @desc    Získání všech predikcí pro daný zápas v dané lize
// @access  Private
router.get('/match/:matchId/league/:leagueId', auth, async (req, res) => {
  try {
    // Kontrola, zda je uživatel členem ligy
    const league = await League.findById(req.params.leagueId);
    
    if (!league) {
      return res.status(404).json({ msg: 'Liga nebyla nalezena' });
    }
    
    const isMember = league.members.some(
      member => member.userId.toString() === req.user.id
    );
    
    if (!isMember) {
      return res.status(403).json({ msg: 'Nejste členem této ligy' });
    }
    
    // Kontrola, zda již uplynula uzávěrka tipů (30 minut před začátkem zápasu)
    const match = await Match.findById(req.params.matchId);
    
    if (!match) {
      return res.status(404).json({ msg: 'Zápas nebyl nalezen' });
    }
    
    const now = new Date();
    const deadline = new Date(match.startTime);
    deadline.setMinutes(deadline.getMinutes() - 30);
    
    // Pokud uzávěrka ještě neuplynula, vrátit pouze predikci aktuálního uživatele
    if (now <= deadline) {
      const prediction = await Prediction.findOne({
        userId: req.user.id,
        matchId: req.params.matchId,
        leagueId: req.params.leagueId
      }).populate('userId', 'name');
      
      return res.json(prediction ? [prediction] : []);
    }
    
    // Pokud uzávěrka již uplynula, vrátit všechny predikce
    const predictions = await Prediction.find({
      matchId: req.params.matchId,
      leagueId: req.params.leagueId
    }).populate('userId', 'name');
    
    res.json(predictions);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Chyba serveru');
  }
});

// @route   GET api/predictions/user/:userId/league/:leagueId
// @desc    Získání všech predikcí daného uživatele v dané lize
// @access  Private
router.get('/user/:userId/league/:leagueId', auth, async (req, res) => {
  try {
    // Kontrola, zda je uživatel členem ligy
    const league = await League.findById(req.params.leagueId);
    
    if (!league) {
      return res.status(404).json({ msg: 'Liga nebyla nalezena' });
    }
    
    const isMember = league.members.some(
      member => member.userId.toString() === req.user.id
    );
    
    if (!isMember) {
      return res.status(403).json({ msg: 'Nejste členem této ligy' });
    }
    
    const predictions = await Prediction.find({
      userId: req.params.userId,
      leagueId: req.params.leagueId
    }).populate('matchId');
    
    res.json(predictions);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Chyba serveru');
  }
});

module.exports = router;
