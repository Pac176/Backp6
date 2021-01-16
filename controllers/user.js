
const bcrypt = require('bcrypt');
const httpStatus = require('http-status');
const jwt = require('jsonwebtoken');
const User = require('../models/user');

exports.signup = async (req, res, next) => {
   try {
    const hash = await bcrypt.hash(req.body.password, 10);
    const user = new User({
      email: req.body.email,
      password: hash
    });

    try {
      await user.save();
      res
        .status(httpStatus.CREATED)
        .json({ message: 'Utilisateur créé !' });
    } catch (error) {
      console.log(error);
      res
        .status(httpStatus.EXPECTATION_FAILED)
        .json({ error });
    }
   } catch (error) {
     console.log(error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ error });
  }
};

exports.login = async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res
        .status(httpStatus.UNAUTHORIZED)
        .json({ error: 'Utilisateur non trouvé !' });
    }
    try {
      const valid = await bcrypt.compare(req.body.password, user.password);
      if (!valid) {
        return res
          .status(httpStatus.UNAUTHORIZED)
          .json({ error: 'Mot de passe incorrect !' });
      }
      res
        .status(httpStatus.OK)
        .json({
          userId: user._id,
          token: jwt.sign({ userId: user._id }, 'RANDOM_TOKEN_SECRET', {
            expiresIn: '24h'
          })
        });
    } catch (error) {
      console.log(error);
      res
        .status(httpStatus.INTERNAL_SERVER_ERROR)
        .json({ error });
    }
  } catch (error) {
    console.log(error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ error });
  }
};
