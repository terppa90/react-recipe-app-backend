/* eslint-disable no-undef */
import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

export const register = async (req, res) => {
  const { username, password } = req.body;
  try {
    // const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ username, password });
    await user.save();
    res.status(201).json({ message: 'User created' });
  } catch (err) {
    res.status(500).json({ error: 'Rekisteröinti epäonnistui' });
    console.log(err);
  }
};

export const login = async (req, res) => {
  console.log('Login body: ', req.body);

  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username });
    if (!user) {
      return res
        .status(400)
        .json({ message: 'Virheellinen käyttäjätunnus tai salasana' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res
        .status(400)
        .json({ message: 'Virheellinen käyttäjätunnus tai salasana' });
    }

    req.session.user = {
      id: user._id,
      username: user.username,
    };

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '3d',
    });

    console.error('Token:', token);

    res.status(200).json({
      _id: user._id,
      username: user.username,
      token,
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Palvelinvirhe' });
  }
};

export const logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Logout error:', err);
      return res.status(500).json({ message: 'Uloskirjautuminen epäonnistui' });
    }
    res.clearCookie('connect.sid'); // Varmuuden vuoksi
    res.status(200).json({ message: 'Uloskirjauduttu onnistuneesti' });
  });
};

export const getCurrentUser = (req, res) => {
  console.log('Get current user: ', req.session.user);
  if (req.session && req.session.user) {
    res.status(200).json(req.session.user);
  } else {
    res.status(401).json({ message: 'Ei kirjautunut käyttäjä' });
  }
};
