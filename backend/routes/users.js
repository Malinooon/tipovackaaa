const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const auth = require('../middleware/auth');

const User = require('../models/User');

// @route   GET api/users/me
// @desc    Získání profilu přihlášeného uživatele
// @access  Private
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ msg: 'Uživatel nebyl nalezen' });
    }
    
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Chyba serveru');
  }
});

// @route   PUT api/users/me
// @desc    Aktualizace profilu přihlášeného uživatele
// @access  Private
router.put(
  '/me',
  [
    auth,
    [
      check('name', 'Jméno je povinné').not().isEmpty()
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, currentPassword, newPassword } = req.body;

    try {
      const user = await User.findById(req.user.id);
      
      if (!user) {
        return res.status(404).json({ msg: 'Uživatel nebyl nalezen' });
      }
      
      // Aktualizace jména
      user.name = name;
      
      // Aktualizace hesla, pokud bylo zadáno
      if (currentPassword && newPassword) {
        // Kontrola současného hesla
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        
        if (!isMatch) {
          return res.status(400).json({ msg: 'Současné heslo není správné' });
        }
        
        // Kontrola nového hesla
        if (newPassword.length < 6) {
          return res.status(400).json({ msg: 'Nové heslo musí mít alespoň 6 znaků' });
        }
        
        // Hashování nového hesla
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
      }
      
      await user.save();
      
      // Vrácení uživatele bez hesla
      const updatedUser = await User.findById(req.user.id).select('-password');
      res.json(updatedUser);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Chyba serveru');
    }
  }
);

// @route   PUT api/users/leagues/:leagueId/displayName
// @desc    Aktualizace zobrazovaného jména uživatele v lize
// @access  Private
router.put(
  '/leagues/:leagueId/displayName',
  [
    auth,
    [
      check('displayName', 'Zobrazované jméno je povinné').not().isEmpty()
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { displayName } = req.body;

    try {
      const user = await User.findById(req.user.id);
      
      if (!user) {
        return res.status(404).json({ msg: 'Uživatel nebyl nalezen' });
      }
      
      // Kontrola, zda je uživatel členem ligy
      const leagueMembership = user.leagueMemberships.find(
        membership => membership.leagueId.toString() === req.params.leagueId
      );
      
      if (!leagueMembership) {
        return res.status(404).json({ msg: 'Nejste členem této ligy' });
      }
      
      // Aktualizace zobrazovaného jména v lize
      leagueMembership.displayName = displayName;
      await user.save();
      
      // Aktualizace zobrazovaného jména v lize
      await League.updateOne(
        { 
          _id: req.params.leagueId,
          'members.userId': req.user.id
        },
        {
          $set: { 'members.$.displayName': displayName }
        }
      );
      
      res.json(user);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Chyba serveru');
    }
  }
);

module.exports = router;
