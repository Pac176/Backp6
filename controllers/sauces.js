const Sauce = require('../models/sauce');
const fs = require('fs');
const httpStatus = require('http-status');
const badRequestMessage = { message: 'Requete non autorisée' };
async function deleteImage(image) {
   try {
     fs.unlink(`images/${image}`, () => {
       console.log("Fichier supprimé");
     });
   } catch (error) {
     console.log(error.message);
     res
       .status(httpStatus.INTERNAL_SERVER_ERROR)
       .json({ error: "Echec Suppression fichier" });
   }
 }
exports.createSauce = async (req, res, next) => {
  const sauceObject = JSON.parse(req.body.sauce);
  delete sauceObject._id;

  try {
    const sauce = new Sauce({
      ...sauceObject,
      imageUrl: `${req.protocol}://${req.get('host')}/images/${
        req.file.filename
      }`
    });
    await sauce.save();
    res.status(httpStatus.CREATED).json({ Message: 'Objet enregistré !' });
  } catch (error) {
    res.status(httpStatus.BAD_REQUEST).json(badRequestMessage);
    deleteImage(req.file.filename)
  }
};

exports.modifySauce = async (req, res, next) => {
  const sauce = await Sauce.findOne({ _id: req.params.id });
  const filename = sauce.imageUrl.split('/images/')[1];
   async function upload (sauce) {
    try {
      await Sauce.updateOne(
        { _id: req.params.id },
        { ...sauce, _id: req.params.id }
      );
      res.status(httpStatus.OK).json({ message: 'Sauce et/ou image modifiées !' });
    } catch (error) {
      deleteImage(req.file.filename); /// ////////pas de creation de fichier avant?
      console.log(error.message);
      res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ error: 'erreure function upload' });
    }
  }
  if (req.file && req.body.sauce) {
    const sauceObject = {
      ...JSON.parse(req.body.sauce),
      imageUrl: `${req.protocol}://${req.get('host')}/images/${
        req.file.filename
      }`
    };
    upload(sauceObject);
    deleteImage(filename);
  } else if (!req.file) {
    const sauceObject = req.body;
    upload(sauceObject);
  } else {
    res.status(httpStatus.BAD_REQUEST).json(badRequestMessage);
  }
};

exports.deleteSauce = async (req, res, next) => {
  try {
    const sauce = await Sauce.findOne({ _id: req.params.id });
    const filename = sauce.imageUrl.split('/images/')[1];
    deleteImage(filename)
      try {
        await Sauce.deleteOne({ _id: req.params.id });
        res.status(httpStatus.OK).json({ Message: 'Objet supprimé !' });
      } catch (error) {
        console.log(error);
        res.status(httpStatus.BAD_REQUEST).json(badRequestMessage);
      }
  } catch (error) {
    console.log(error.message);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ error: 'erreure fonction deleteSauce' });
  };
};

exports.getOneSauce = async (req, res, next) => {
  try {
    const oneSauce = await Sauce.findOne({ _id: req.params.id });
    res.status(httpStatus.OK).json(oneSauce);
  } catch (error) {
    console.log(error.message);
    res.status(httpStatus.BAD_REQUEST).json(badRequestMessage);
  }
};
exports.getAllSauce = async (req, res, next) => {
  try {
    const allSauces = await Sauce.find();
    res.status(httpStatus.OK).json(allSauces);
  } catch (error) {
    console.log(error.message);
    res.status(httpStatus.BAD_REQUEST).json(badRequestMessage);
  }
};

exports.likeSauce = async (req, res, next) => {
  const cancelOpinionMessage = { message: 'Ton avis a bien été annulé' };
  const successOpinionMessage = { message: 'Ton avis a été pris en compte!' };
  const fordiddenRepetitionMessage = {
    message: 'Vote deja pris en compte, annule ton vote pour changer'
  };
  const pushDislike = { usersDisliked: req.body.userId };
  const pushLike = { usersLiked: req.body.userId };

  function responseBadRequest (message) {
    return res.status(httpStatus.BAD_REQUEST).json(message);
  }
  /* factorisation de la fonction addopinion */
  function addOpinion (increment, likeOrDislike) {
    Sauce.updateOne(
      { _id: req.params.id },
      {
        $inc: increment,
        $push: likeOrDislike
      }
    )
      .then(() => res.status(httpStatus.OK).json(successOpinionMessage))
      .catch(() => responseBadRequest(fordiddenRepetitionMessage));
  }
  /* factorisation de la fonction deleteopinion */
  function deleteOpinion (increment, likeOrDislike) {
    Sauce.updateOne(
      { _id: req.params.id },
      {
        $inc: increment,
        $pull: likeOrDislike
      }
    )
      .then(() => res.status(httpStatus.OK).json(cancelOpinionMessage))
      .catch(() => responseBadRequest(badRequestMessage));
  }
  /* factorisation de findOne */

  try {
    const currentSauce = await Sauce.findOne({ _id: req.params.id });
    switch (req.body.like) {
      case 0:
        if (currentSauce.usersLiked.includes(req.body.userId)) {
          deleteOpinion({ likes: -1 }, pushLike);
        } else if (currentSauce.usersDisliked.includes(req.body.userId)) {
          deleteOpinion({ dislikes: -1 }, pushDislike);
        } else {
          responseBadRequest(badRequestMessage);
        }
        break;
      case 1:
        if (
          !currentSauce.usersLiked.includes(req.body.userId) &&
          !currentSauce.usersDisliked.includes(req.body.userId)
        ) {
          addOpinion({ likes: +1 }, pushLike);
        } else {
          responseBadRequest(fordiddenRepetitionMessage);
        }
        break;
      case -1:
        if (
          !currentSauce.usersLiked.includes(req.body.userId) &&
          !currentSauce.usersDisliked.includes(req.body.userId)
        ) {
          addOpinion({ dislikes: +1 }, pushDislike);
        } else {
          responseBadRequest(fordiddenRepetitionMessage);
        }
        break;
      default:
        console.log('Tentative de contournement de la requete like');
        responseBadRequest(badRequestMessage);
        break;
    }
  } catch (error) {
    console.log('Cannot get OneSauce', error);
    responseBadRequest(fordiddenRepetitionMessage);
  }
};
