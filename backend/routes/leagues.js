const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const auth = require('../middleware/auth');

const League = require('../models/League');
const User = require('../models/User');

// @route   POST api/leagues
// @desc    Vytvoření nové ligy
// @access  Private
router.post(
  '/',
  [
    auth,
    [
      check('name', 'Název ligy je povinný').not().isEmpty(),
      check('password', 'Heslo ligy je povinné').not().isEmpty()
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, password, displayName } = req.body;

    try {
      // Kontrola, zda liga s tímto názvem již existuje
      let league = await League.findOne({ name });

      if (league) {
        return res.status(400).json({ msg: 'Liga s tímto názvem již existuje' });
      }

      // Vytvoření nové ligy
      league = new League({
        name,
        password,
        createdBy: req.user.id,
        members: [
          {
            userId: req.user.id,
            displayName: displayName || req.user.name
          }
        ]
      });

      await league.save();

      // Přidání ligy do členství uživatele
      await User.findByIdAndUpdate(
        req.user.id,
        {
          $push: {
            leagueMemberships: {
              leagueId: league._id,
              displayName: displayName || req.user.name
            }
          }
        }
      );

      res.json(league);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Chyba serveru');
    }
  }
);

// @route   POST api/leagues/join
// @desc    Připojení k existující lize
// @access  Private
router.post(
  '/join',
  [
    auth,
    [
      check('name', 'Název ligy je povinný').not().isEmpty(),
      check('password', 'Heslo ligy je povinné').not().isEmpty(),
      check('displayName', 'Zobrazované jméno je povinné').not().isEmpty()
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, password, displayName } = req.body;

    try {
      // Nalezení ligy podle názvu
      const league = await League.findOne({ name });

      if (!league) {
        return res.status(404).json({ msg: 'Liga nebyla nalezena' });
      }

      // Kontrola hesla
      if (league.password !== password) {
        return res.status(400).json({ msg: 'Nesprávné heslo ligy' });
      }

      // Kontrola, zda uživatel již není členem ligy
      const isMember = league.members.some(
        member => member.userId.toString() === req.user.id
      );

      if (isMember) {
        return res.status(400).json({ msg: 'Již jste členem této ligy' });
      }

      // Přidání uživatele do ligy
      league.members.push({
        userId: req.user.id,
        displayName
      });

      await league.save();

      // Přidání ligy do členství uživatele
      await User.findByIdAndUpdate(
        req.user.id,
        {
          $push: {
            leagueMemberships: {
              leagueId: league._id,
              displayName
            }
          }
        }
      );

      res.json(league);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Chyba serveru');
    }
  }
);

// @route   GET api/leagues
// @desc    Získání všech lig, kterých je uživatel členem
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ msg: 'Uživatel nenalezen' });
    }

    const leagueIds = user.leagueMemberships.map(membership => membership.leagueId);
    
    const leagues = await League.find({ _id: { $in: leagueIds } })
      .select('-password')
      .populate('members.userId', 'name');

    res.json(leagues);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Chyba serveru');
  }
});

// @route   GET api/leagues/:id
// @desc    Získání konkrétní ligy podle ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const league = await League.findById(req.params.id)
      .select('-password')
      .populate('members.userId', 'name');

    if (!league) {
      return res.status(404).json({ msg: 'Liga nebyla nalezena' });
    }

    // Kontrola, zda je uživatel členem ligy
    const isMember = league.members.some(
      member => member.userId._id.toString() === req.user.id
    );

    if (!isMember) {
      return res.status(403).json({ msg: 'Přístup odepřen' });
    }

    res.json(league);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Liga nebyla nalezena' });
    }
    res.status(500).send('Chyba serveru');
  }
});

// @route   PUT api/leagues/:id
// @desc    Aktualizace ligy (pouze pro tvůrce ligy)
// @access  Private
router.put(
  '/:id',
  [
    auth,
    [
      check('name', 'Název ligy je povinný').not().isEmpty(),
      check('password', 'Heslo ligy je povinné').not().isEmpty()
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, password, scoringRules } = req.body;

    try {
      let league = await League.findById(req.params.id);

      if (!league) {
        return res.status(404).json({ msg: 'Liga nebyla nalezena' });
      }

      // Kontrola, zda je uživatel tvůrcem ligy
      if (league.createdBy.toString() !== req.user.id) {
        return res.status(403).json({ msg: 'Nemáte oprávnění upravovat tuto ligu' });
      }

      // Aktualizace ligy
      if (name) league.name = name;
      if (password) league.password = password;
      if (scoringRules) league.scoringRules = scoringRules;

      await league.save();

      res.json(league);
    } catch (err) {
      console.error(err.message);
      if (err.kind === 'ObjectId') {
        return res.status(404).json({ msg: 'Liga nebyla nalezena' });
      }
      res.status(500).send('Chyba serveru');
    }
  }
);

// @route   DELETE api/leagues/:id/members/:userId
// @desc    Odstranění člena z ligy (pouze pro tvůrce ligy)
// @access  Private
router.delete('/:id/members/:userId', auth, async (req, res) => {
  try {
    const league = await League.findById(req.params.id);

    if (!league) {
      return res.status(404).json({ msg: 'Liga nebyla nalezena' });
    }

    // Kontrola, zda je uživatel tvůrcem ligy
    if (league.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ msg: 'Nemáte oprávnění spravovat členy této ligy' });
    }

    // Odstranění člena z ligy
    league.members = league.members.filter(
      member => member.userId.toString() !== req.params.userId
    );

    await league.save();

    // Odstranění ligy z členství uživatele
    await User.findByIdAndUpdate(
      req.params.userId,
      {
        $pull: {
          leagueMemberships: { leagueId: league._id }
        }
      }
    );

    res.json({ msg: 'Člen byl odstraněn z ligy' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Liga nebo uživatel nebyli nalezeni' });
    }
    res.status(500).send('Chyba serveru');
  }
});

module.exports = router;
