/* eslint-disable no-undef */
import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

export const register = async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = new User({ username, password });
    await user.save();
    res.status(201).json({ message: 'User created' });
  } catch (err) {
    res.status(500).json({ error: 'Rekisteröinti epäonnistui' });
    console.log(err);
  }
};

export const login = async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: 'Virheelliset tunnistetiedot' });
    }

    const token = jwt.sign(
      { id: user._id, username: user.username },
      process.env.JWT_SECRET,
      {
        expiresIn: '7d',
      }
    );

    res
      .cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        // sameSite: 'Strict', // lokaalisti
        sameSite: 'none',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      })
      .json({ message: 'Kirjautuminen onnistui' });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Palvelinvirhe' });
  }
};

export const logout = (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'Strict',
  });
  res.status(200).json({ message: 'Uloskirjauduttu onnistuneesti' });
};

export const getCurrentUser = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res
        .status(401)
        .json({ message: 'Käyttäjä ei ole kirjautunut sisään' });
    }

    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'Käyttäjää ei löytynyt' });
    }

    res.json({ id: user._id, username: user.username });
  } catch (err) {
    console.error('Virhe haettaessa käyttäjää:', err);
    res.status(500).json({ message: 'Palvelinvirhe käyttäjän haussa' });
  }
};
