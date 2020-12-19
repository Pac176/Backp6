const Sauce = require('../models/sauce');
const fs = require('fs');
const httpStatus = require('http-status');
const sauce = require('../models/sauce');
const user = require('../models/user');
// const { BAD_REQUEST } = require('http-status'); question

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
    .catch(error => res.status(BAD_REQUEST).json({ error }));
};

exports.deleteSauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id })
    .then(sauce => {
      const filename = sauce.imageUrl.split('/images/')[1];
      fs.unlink(`images/${filename}`, () => {
        Sauce.deleteOne({ _id: req.params.id })
          .then(() => res.status(httpStatus.OK).json({ Message: 'Objet supprimé !' }))
          .catch(error => res.status(BAD_REQUEST).json({ error }));
      });
    })
    .catch(error => res.status(500).json({ error }));
};

exports.getOneSauce = (req, res, next) => {
  Sauce.findOne()
    .then(sauces => res.status(httpStatus.OK).json(sauces))
    .catch(error => res.status(BAD_REQUEST).json({ error }));
};
exports.getAllSauce = (req, res, next) => {
  Sauce.find()
    .then(sauces => res.status(httpStatus.OK).json(sauces))
    .catch(error => res.status(BAD_REQUEST).json({ error }));
};

exports.likeSauce = (req, res, next) => {
  console.log(req.params);
  // En fonction du like de la requete j'ajoute le user dans le tableau et je comptabilise les likes
  // console.log(req.body.userId)
  switch (req.body.like) {
    // Si j'aime = 0, l'utilisateur annule ce qu'il aime ou ce qu'il n'aime pas. Suppression du user des tableaux array usersliked et userdisliked, -1  sur le likes ou dislikes
    case 0:
      // Pour eviter les doublons je dois interroger les 2 tableaux de la sauce selectionée et voir si user est deja dedans, si c'est le cas je dois le supprimer du tableau.

      Sauce.findOne({ _id: req.params.id })
        .then((sauce) => {
          if (sauce.usersLiked.includes(req.body.userId)) {
            Sauce.updateOne({ _id: req.params.id },
              {
                $inc: { likes: -1 },
                $pull: { usersLiked: req.body.userId },
                _id: req.params.id
              })
              .then(sauces => res.status(httpStatus.OK).json({Message : 'Ton avis est annulé'}))
              .catch(error => res.status(httpStatus.BAD_REQUEST).json({ error }));
          } if (sauce.usersDisliked.includes(req.body.userId)) {
            Sauce.updateOne({ _id: req.params.id },
              {
                $inc: { dislikes: -1 },
                $pull: { usersDisliked: req.body.userId }
              })
              .then(sauces => res.status(httpStatus.OK).json({Message : 'Ton avis est annulé'}))
              .catch(error => res.status(httpStatus.BAD_REQUEST).json({ error }));
          }
        })
    break;
    // si j'aime = 1,l'utilisateur aime la sauce, un like de plus et le user s'ajoute au tableau usersLiked
    case 1:

      if (req.body.userId) {
        Sauce.updateOne({ _id: req.params.id }, {
          $inc: { likes: +1 },
          $push: { usersLiked: req.body.userId },
          _id: req.params.id
        })
          .then(() => { res.status(httpStatus.CREATED).json({ Message: 'Ton avis positif a été pris en compte!' }) })
          .catch((error) => { res.status(httpStatus.BAD_REQUEST).json({ error }) });
      }
      break;

      /* Si j'aime =-1, l'utilisateur n'aime pas la sauce. un dislikes en plus et l'user est ajouté au tableau usersDisliked */

    case -1:
      Sauce.updateOne({ _id: req.params.id }, {
        $inc: { dislikes: +1 },
        $push: { usersDisliked: req.body.userId },
        _id: req.params.id
      })
        .then(() => { res.status(httpStatus.CREATED).json({Message:'Ton avis négatif a été pris en compte!' }) })
        .catch((error) => { res.status(httpStatus.BAD_REQUEST).json({ error }) });
      break;

      // L'identifiant del'utilisateur doit être ajouté ou supprimé du tableau approprié, en gardant une trace de ses préférences et en l'empêchant d'aimer ou de ne pas aimer la même sauce plusieurs fois. Nombre total de 'j'aime' et de 'je n'aime pas' à mettre à jour avec chaque 'j'aime'.

    default:
      break;
  }
};
