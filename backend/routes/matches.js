const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');

const Match = require('../models/Match');
const Prediction = require('../models/Prediction');
const { evaluatePredictions } = require('../utils/sportsDbApi');

// @route   GET api/matches
// @desc    Získání všech zápasů
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const matches = await Match.find().sort({ startTime: 1 });
    res.json(matches);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Chyba serveru');
  }
});

// @route   GET api/matches/:id
// @desc    Získání konkrétního zápasu podle ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const match = await Match.findById(req.params.id);
    
    if (!match) {
      return res.status(404).json({ msg: 'Zápas nebyl nalezen' });
    }
    
    res.json(match);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Zápas nebyl nalezen' });
    }
    res.status(500).send('Chyba serveru');
  }
});

// @route   POST api/matches
// @desc    Vytvoření nového zápasu (pouze pro adminy)
// @access  Admin
router.post(
  '/',
  [
    adminAuth,
    [
      check('matchId', 'ID zápasu je povinné').not().isEmpty(),
      check('homeTeam', 'Domácí tým je povinný').not().isEmpty(),
      check('awayTeam', 'Hostující tým je povinný').not().isEmpty(),
      check('homeTeamFlag', 'Vlajka domácího týmu je povinná').not().isEmpty(),
      check('awayTeamFlag', 'Vlajka hostujícího týmu je povinná').not().isEmpty(),
      check('stage', 'Fáze turnaje je povinná').not().isEmpty(),
      check('startTime', 'Čas začátku zápasu je povinný').not().isEmpty()
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      matchId,
      homeTeam,
      awayTeam,
      homeTeamFlag,
      awayTeamFlag,
      stage,
      group,
      startTime
    } = req.body;

    try {
      // Kontrola, zda zápas s tímto ID již existuje
      let match = await Match.findOne({ matchId });

      if (match) {
        return res.status(400).json({ msg: 'Zápas s tímto ID již existuje' });
      }

      // Vytvoření nového zápasu
      match = new Match({
        matchId,
        homeTeam,
        awayTeam,
        homeTeamFlag,
        awayTeamFlag,
        stage,
        group,
        startTime: new Date(startTime)
      });

      await match.save();

      res.json(match);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Chyba serveru');
    }
  }
);

// @route   PUT api/matches/:id/result
// @desc    Manuální aktualizace výsledku zápasu (pouze pro adminy)
// @access  Admin
router.put(
  '/:id/result',
  [
    adminAuth,
    [
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

    const { homeScore, awayScore, endingType } = req.body;

    try {
      let match = await Match.findById(req.params.id);

      if (!match) {
        return res.status(404).json({ msg: 'Zápas nebyl nalezen' });
      }

      // Aktualizace výsledku zápasu
      match.result = {
        homeScore,
        awayScore,
        endingType,
        isFinished: true
      };
      match.manuallyUpdated = true;
      match.manuallyUpdatedAt = new Date();
      match.manuallyUpdatedBy = req.user.id;

      await match.save();

      // Vyhodnocení predikcí pro tento zápas
      await evaluatePredictions(match);

      res.json(match);
    } catch (err) {
      console.error(err.message);
      if (err.kind === 'ObjectId') {
        return res.status(404).json({ msg: 'Zápas nebyl nalezen' });
      }
      res.status(500).send('Chyba serveru');
    }
  }
);

// @route   GET api/matches/group/:group
// @desc    Získání zápasů podle skupiny
// @access  Private
router.get('/group/:group', auth, async (req, res) => {
  try {
    const matches = await Match.find({ 
      stage: 'group',
      group: req.params.group 
    }).sort({ startTime: 1 });
    
    res.json(matches);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Chyba serveru');
  }
});

// @route   GET api/matches/stage/:stage
// @desc    Získání zápasů podle fáze turnaje
// @access  Private
router.get('/stage/:stage', auth, async (req, res) => {
  try {
    const matches = await Match.find({ 
      stage: req.params.stage 
    }).sort({ startTime: 1 });
    
    res.json(matches);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Chyba serveru');
  }
});

module.exports = router;
