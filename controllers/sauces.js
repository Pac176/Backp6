const Sauce = require('../models/sauce');
const fs = require('fs');
const httpStatus = require('http-status');
// const sauce = require('../models/sauce');
// const user = require('../models/user');

exports.createSauce = (req, res, next) => {
  const sauceObject = JSON.parse(req.body.sauce);
  delete sauceObject._id;
  const sauce = new Sauce({
    ...sauceObject,
    imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
  });

  sauce.save()
    .then(() => res.status(httpStatus.CREATED).json({ Message: 'Objet enregistré !' }))
    .catch(error => {
      res.status(httpStatus.BAD_REQUEST).json({ error });
      fs.unlink(`images/${req.file.filename}`, (err) => {
        if (err) throw err;
        console.log(`${req.file.filename} was deleted`);
      });
    });
};

exports.modifySauce = (req, res, next) => {
  const sauceObject = req.file
    ? {
        ...JSON.parse(req.body.sauce),
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
      }
    : { ...req.body };

  Sauce.updateOne({ _id: req.params.id }, { ...sauceObject, _id: req.params.id })
    .then(() => res.status(httpStatus.OK).json({ Message: 'Objet modifié !' }))
    .catch(error => res.status(httpStatus.BAD_REQUEST).json({ error }));
};

exports.deleteSauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id })
    .then(sauce => {
      const filename = sauce.imageUrl.split('/images/')[1];
      fs.unlink(`images/${filename}`, () => {
        Sauce.deleteOne({ _id: req.params.id })
          .then(() => res.status(httpStatus.OK).json({ Message: 'Objet supprimé !' }))
          .catch(error => res.status(httpStatus.BAD_REQUEST).json({ error }));
      });
    })
    .catch(error => res.status(500).json({ error }));
};

exports.getOneSauce = (req, res, next) => {
  Sauce.findOne()
    .then(sauces => res.status(httpStatus.OK).json(sauces))
    .catch(error => res.status(httpStatus.BAD_REQUEST).json({ error }));
};
exports.getAllSauce = (req, res, next) => {
  Sauce.find()
    .then(sauces => res.status(httpStatus.OK).json(sauces))
    .catch(error => res.status(httpStatus.BAD_REQUEST).json({ error }));
};

exports.likeSauce = (req, res, next) => {
  const cancelOpinionSuccessMessage = { message: 'ton avis est annulé' };
  const opinionSuccessMessage = { message: 'Ton avis a été pris en compte!' };
  const badRequestMessage = { message: "la requete n'est pas valide" };
  const fordiddenRepetitionMessage = { message: 'vote deja pris en compte, annule ton vote pour changer' };
  const pushDislike = { usersDisliked: req.body.userId };
  const pushLike = { usersLiked: req.body.userId };
  function push (increment, likeOrDislike) {
    Sauce.updateOne({ _id: req.params.id },
      {
        $inc: increment,
        $push: likeOrDislike
      })
      .then(() => res.status(httpStatus.OK).json(opinionSuccessMessage))
      .catch(() => res.status(httpStatus.httpStatus.BAD_REQUEST).json(fordiddenRepetitionMessage));
  }
  function pull (increment, likeOrDislike) {
    Sauce.updateOne({ _id: req.params.id },
      {
        $inc: increment,
        $pull: likeOrDislike
      })
      .then(() => res.status(httpStatus.OK).json(cancelOpinionSuccessMessage))
      .catch(() => res.status(httpStatus.httpStatus.BAD_REQUEST).json(badRequestMessage));
  }

  switch (req.body.like) {
    case 0:
      Sauce.findOne({ _id: req.params.id })
        .then((sauce) => {
          if (sauce.usersLiked.includes(req.body.userId)) {
            pull({ likes: -1 }, pushLike);
          } else if (sauce.usersDisliked.includes(req.body.userId)) {
            pull({ dislikes: -1 }, pushDislike);
          } else {
            res.status(httpStatus.BAD_REQUEST).json({ message: 'tu ne peux plus annuler ton vote banane!!' });
          }
        });
      break;
    case 1:
      Sauce.findOne({ _id: req.params.id })
        .then(sauce => {
          if (!(sauce.usersLiked.includes(req.body.userId)) && (!(sauce.usersDisliked.includes(req.body.userId)))) {
            push({ likes: +1 }, pushLike);
          } else {
            res.status(httpStatus.OK).json({ message: 'Deja voté' });
          }
        })
        .catch(() => res.status(httpStatus.BAD_REQUEST).json({ message: 'vote deja pris en compte, annule ton vote pour changer' }));
      break;
    case -1:
      Sauce.findOne({ _id: req.params.id })
        .then(sauce => {
          if (!(sauce.usersLiked.includes(req.body.userId)) && (!(sauce.usersDisliked.includes(req.body.userId)))) {
            push({ dislikes: +1 }, pushDislike);
          } else {
            res.status(httpStatus.OK).json({ message: 'Deja voté' });
          }
        })
        .catch(() => res.status(httpStatus.BAD_REQUEST).json({ message: 'vote deja pris en compte, annule ton vote pour changer' }));
      break;
    default:
       res.status(httpStatus.BAD_REQUEST).json({ message: "la requete n'est pas valide" });
      break;
  }
};
