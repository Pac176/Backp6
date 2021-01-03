
const bcrypt = require('bcrypt');
const httpStatus = require('http-status');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const MaskData = require('maskdata');
const emailMask2Options = {
  maskWith: "*",
  unmaskedStartCharactersBeforeAt: 3,
  unmaskedEndCharactersAfterAt: 2,
  maskAtTheRate: false,
};
//const EMAIL_REGEX = /^\w+[\w-\.]*\@\w+((-\w+)|(\w*))\.[a-z]{2,3}$/;
//const PASSWORD_REGEX = /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/;
let maskedEmail;

exports.signup = (req, res, next) => {
maskedEmail = MaskData.maskEmail2(req.body.email, emailMask2Options);
  /* ajout d'une validation de données email et mot de passe fort 
Au moins une lettre majuscule,(?=.*?[A-Z])
Au moins une lettre minuscule, (?=.*?[a-z])
Au moins un chiffre, (?=.*?[0-9])
Au moins un caractère spécial, (?=.*?[#?!@$%^&*-])
Longueur minimale de huit .{8,}(avec les ancres)*/
  
  // if (!EMAIL_REGEX.test(req.body.email)) {
  //   res.status(httpStatus.NOT_ACCEPTABLE).json({ message: 'mauvais email' });
  // } else if (!PASSWORD_REGEX.test(req.body.password)) {
  //   res.status(httpStatus.NOT_ACCEPTABLE).json({ message: 'mauvais password' });
  // } else {
  //   /* Hashage et salage du mot de passe grace a bcrypt */
    bcrypt.hash(req.body.password, 10)
      .then(hash => {
        const user = new User({
          email: maskedEmail,
          password: hash,
        });
        user.save()
          .then(() => res.status(httpStatus.CREATED).json({ message: 'Utilisateur créé !' }))
          .catch(error => res.status(httpStatus.BAD_REQUEST).json({ error }));
      })
      .catch(error => res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ error }));
  }
//};

exports.login = (req, res, next) => {
  User.findOne({ email: maskedEmail })
    .then((user) => {
      if (!user) {
        return res
          .status(httpStatus.UNAUTHORIZED)
          .json({ error: "Utilisateur non trouvé !" });
      }
      bcrypt
        .compare(req.body.password, user.password)
        .then((valid) => {
          if (!valid) {
            return res
              .status(httpStatus.UNAUTHORIZED)
              .json({ error: "Mot de passe incorrect !" });
          }
          res.status(httpStatus.OK).json({
            userId: user._id,
            token: jwt.sign({ userId: user._id }, "RANDOM_TOKEN_SECRET", {
              expiresIn: "24h",
            }),
          });
        })
        .catch((error) =>
          res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ error })
        );
    })
    .catch((error) =>
      res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ error })
    );
};
