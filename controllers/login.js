const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const loginRouter = require('express').Router();
const User = require('../models/user');
const config = require('../utils/config');

loginRouter.post('/', async (req, res, next) => {
  const { body } = req;

  try {
    const user = await User.findOne({ username: body.username });
    // eslint-disable-next-line operator-linebreak
    const passwordCorrect =
      user === null
        ? false
        : await bcrypt.compare(body.password, user.passwordHash);

    if (!(user && passwordCorrect)) {
      return res.status(401).json({ error: 'invalid username or password' });
    }

    const userForToken = {
      username: user.username,
      id: user._id,
    };

    const token = jwt.sign(userForToken, config.JWT_SECRET);

    res.status(200).json({ token, username: user.username, name: user.name });
  } catch (exception) {
    next(exception);
  }
});

module.exports = loginRouter;
