const express = require('express');
const User = require('../models/User');
const bcrypt = require('bcrypt');
const router = express.Router();

router.get('/login', (req, res) => res.render('login'));
router.get('/register', (req, res) => res.render('register'));

router.post('/register', async (req, res) => {
  const user = new User(req.body);
  await user.save();
  res.redirect('/login');
});

router.post('/login', async (req, res) => {
  const user = await User.findOne({ username: req.body.username });
  if (!user || !(await bcrypt.compare(req.body.password, user.password))) {
    return res.send('Credenciales incorrectas');
  }
  req.session.userId = user._id;
  res.redirect('/novelas');
});

router.get('/logout', (req, res) => {
  req.session.destroy(() => res.redirect('/login'));
});

module.exports = router;
