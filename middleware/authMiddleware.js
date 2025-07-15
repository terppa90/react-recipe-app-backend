import jwt from 'jsonwebtoken';

const authenticateJWT = async (req, res, next) => {
  const token = req.cookies.token; // Otetaan token evästeestä

  if (!token) {
    return res.status(401).json({ message: 'Ei valtuutusta – token puuttuu' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, username }
    next(); // Käyttäjä on autentikoitu, siirry seuraavaan middlewareen
  } catch (err) {
    console.error('JWT virhe:', err);
    return res
      .status(403)
      .json({ message: 'Virheellinen tai vanhentunut token' });
  }
};

export default authenticateJWT;
