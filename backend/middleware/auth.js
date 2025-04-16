const jwt = require('jsonwebtoken');

module.exports = function(req, res, next) {
  // Získání tokenu z hlavičky
  const token = req.header('x-auth-token');

  // Kontrola, zda token existuje
  if (!token) {
    return res.status(401).json({ msg: 'Přístup odepřen, chybí token' });
  }

  try {
    // Ověření tokenu
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Přidání uživatele do požadavku
    req.user = decoded.user;
    next();
  } catch (err) {
    res.status(401).json({ msg: 'Token není platný' });
  }
};
