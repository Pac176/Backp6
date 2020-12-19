
const bcrypt = require('bcrypt');
const httpStatus = require('http-status');
const jwt = require('jsonwebtoken');
const User = require('../models/user');

exports.signup = (req, res, next) => {
  bcrypt.hash(req.body.password, 10)
    .then(hash => {
      const user = new User({
        email: req.body.email,
        password: hash
      });
      user.save()
        .then(() => res.status(httpStatus.CREATED).json({ message: 'Utilisateur créé !' }))
        .catch(error => res.status(httpStatus.BAD_REQUEST).json({ error }));
    })
    .catch(error => res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ error }));
};

exports.login = (req, res, next) => {
  User.findOne({ email: req.body.email })
    .then(user => {
      if (!user) {
        return res.status(httpStatus.UNAUTHORIZED).json({ error: 'Utilisateur non trouvé !' });
      }
      bcrypt.compare(req.body.password, user.password)
        .then(valid => {
          if (!valid) {
            return res.status(httpStatus.UNAUTHORIZED).json({ error: 'Mot de passe incorrect !' });
          }
          res.status(httpStatus.OK).json({
            userId: user._id,
            token: jwt.sign(
              { userId: user._id },
              'RANDOM_TOKEN_SECRET',
              { expiresIn: '24h' }
            )
          });
        })
        .catch(error => res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ error }));
    })
    .catch(error => res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ error }));
};
