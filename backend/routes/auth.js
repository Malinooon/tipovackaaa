const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { check, validationResult } = require('express-validator');

const User = require('../models/User');

// @route   POST api/auth/register
// @desc    Registrace uživatele
// @access  Public
router.post(
  '/register',
  [
    check('name', 'Jméno je povinné').not().isEmpty(),
    check('email', 'Zadejte platný email').isEmail(),
    check('password', 'Heslo musí mít alespoň 6 znaků').isLength({ min: 6 })
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password } = req.body;

    try {
      // Kontrola, zda uživatel již existuje
      let user = await User.findOne({ email });

      if (user) {
        return res.status(400).json({ msg: 'Uživatel s tímto emailem již existuje' });
      }

      user = new User({
        name,
        email,
        password
      });

      // Hashování hesla
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);

      await user.save();

      // Vytvoření JWT tokenu
      const payload = {
        user: {
          id: user.id
        }
      };

      jwt.sign(
        payload,
        process.env.JWT_SECRET,
        { expiresIn: '7d' },
        (err, token) => {
          if (err) throw err;
          res.json({ token });
        }
      );
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Chyba serveru');
    }
  }
);

// @route   POST api/auth/login
// @desc    Přihlášení uživatele a získání tokenu
// @access  Public
router.post(
  '/login',
  [
    check('email', 'Zadejte platný email').isEmail(),
    check('password', 'Heslo je povinné').exists()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
      // Kontrola, zda uživatel existuje
      let user = await User.findOne({ email });

      if (!user) {
        return res.status(400).json({ msg: 'Neplatné přihlašovací údaje' });
      }

      // Kontrola hesla
      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        return res.status(400).json({ msg: 'Neplatné přihlašovací údaje' });
      }

      // Vytvoření JWT tokenu
      const payload = {
        user: {
          id: user.id
        }
      };

      jwt.sign(
        payload,
        process.env.JWT_SECRET,
        { expiresIn: '7d' },
        (err, token) => {
          if (err) throw err;
          res.json({ token });
        }
      );
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Chyba serveru');
    }
  }
);

module.exports = router;
