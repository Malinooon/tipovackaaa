const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');
const { check, validationResult } = require('express-validator');

const User = require('../models/User');
const Match = require('../models/Match');
const { updateMatchResults } = require('../utils/sportsDbApi');

// @route   GET api/admin/users
// @desc    Získání všech uživatelů (pouze pro adminy)
// @access  Admin
router.get('/users', adminAuth, async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Chyba serveru');
  }
});

// @route   PUT api/admin/users/:id/admin
// @desc    Nastavení/odebrání admin práv uživateli (pouze pro adminy)
// @access  Admin
router.put('/users/:id/admin', adminAuth, async (req, res) => {
  try {
    const { isAdmin } = req.body;
    
    // Kontrola, zda uživatel existuje
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ msg: 'Uživatel nebyl nalezen' });
    }
    
    // Aktualizace admin práv
    user.isAdmin = isAdmin;
    await user.save();
    
    res.json(user);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Uživatel nebyl nalezen' });
    }
    res.status(500).send('Chyba serveru');
  }
});

// @route   POST api/admin/matches/import
// @desc    Import zápasů z API (pouze pro adminy)
// @access  Admin
router.post('/matches/import', adminAuth, async (req, res) => {
  try {
    await updateMatchResults();
    res.json({ msg: 'Import zápasů byl úspěšně dokončen' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Chyba serveru');
  }
});

// @route   POST api/admin/matches/evaluate
// @desc    Manuální vyhodnocení predikcí pro všechny dokončené zápasy (pouze pro adminy)
// @access  Admin
router.post('/matches/evaluate', adminAuth, async (req, res) => {
  try {
    const { evaluatePredictions } = require('../utils/sportsDbApi');
    
    // Získání všech dokončených zápasů
    const matches = await Match.find({ 'result.isFinished': true });
    
    for (const match of matches) {
      await evaluatePredictions(match);
    }
    
    res.json({ msg: 'Vyhodnocení predikcí bylo úspěšně dokončeno' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Chyba serveru');
  }
});

// @route   POST api/admin/matches
// @desc    Vytvoření nového zápasu (pouze pro adminy)
// @access  Admin
router.post(
  '/matches',
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

module.exports = router;
