const SauceModel = require('../models/sauce');
const fs = require('fs');
const httpStatus = require('http-status');
const badRequestMessage = { message: 'Requete non autorisée' };
async function deleteImage (res, image) {
  try {
    fs.unlink(`images/${image}`, () => {
      console.log('Fichier supprimé');
    });
  } catch (error) {
    console.log(error.message);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ error: 'Echec Suppression fichier' });
  }
}
async function upload (newSauce, req, res) {
  try {
    await SauceModel.updateOne(
      { _id: req.params.id },
      { ...newSauce, _id: req.params.id }
    );
    res
      .status(httpStatus.OK)
      .json({ message: 'SauceModel et/ou image modifiées !' });
  } catch (error) {
    if (req.file) {
      deleteImage(res, req.file.filename);
    }
    console.log(error.message);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ error: 'erreur function upload' });
  }
}
function responseBadRequest (res, message) {
  return res
    .status(httpStatus.BAD_REQUEST)
    .json(message);
}
exports.createSauce = async (req, res, next) => {
  const sendSauce = JSON.parse(req.body.sauce);
  delete sendSauce._id;
  try {
    const newSauce = new SauceModel({
      ...sendSauce,
      imageUrl: `${req.protocol}://${req.get('host')}/images/${
        req.file.filename
      }`
    });
    await newSauce.save();
    res.status(httpStatus.CREATED).json({ Message: 'Objet enregistré !' });
  } catch (error) {
    console.log(error);
    responseBadRequest(res, badRequestMessage);
    deleteImage(res, req.file.filename);
  }
};
exports.modifySauce = async (req, res, next) => {
  const oldSauce = await SauceModel.findOne({ _id: req.params.id });
  const filename = oldSauce.imageUrl.split('/images/')[1];
  if (req.file && req.body.sauce) {
    const newSauce = {
      ...JSON.parse(req.body.sauce),
      imageUrl: `${req.protocol}://${req.get('host')}/images/${
        req.file.filename
      }`
    };
    upload(newSauce, req, res);
    deleteImage(res, filename);
  } else if (!req.file) {
    const sendSauce = req.body;
    upload(sendSauce, req, res);
  } else {
    responseBadRequest(res, badRequestMessage);
  }
};
exports.deleteSauce = async (req, res, next) => {
  try {
    const oldSauce = await SauceModel.findOne({ _id: req.params.id });
    const oldSauceFilename = oldSauce.imageUrl.split('/images/')[1];
    deleteImage(res, oldSauceFilename);
    try {
      await SauceModel.deleteOne({ _id: req.params.id });
      res
        .status(httpStatus.OK)
        .json({ Message: 'Objet supprimé !' });
    } catch (error) {
      console.log(error.message);
      responseBadRequest(res, badRequestMessage);
    }
  } catch (error) {
    console.log(error.message);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ error: 'erreure fonction deleteSauce' });
  };
};
exports.getOneSauce = async (req, res, next) => {
  try {
    const oneSauceFind = await SauceModel.findOne({ _id: req.params.id });
    res
      .status(httpStatus.OK)
      .json(oneSauceFind);
  } catch (error) {
    console.log(error.message);
    responseBadRequest(res, badRequestMessage);
  }
};
exports.getAllSauce = async (req, res, next) => {
  try {
    const allSaucesFind = await SauceModel.find();
    res
      .status(httpStatus.OK)
      .json(allSaucesFind);
  } catch (error) {
    console.log(error.message);
    res
      .status(httpStatus.BAD_REQUEST)
      .json(badRequestMessage);
  }
};
exports.likeSauce = async (req, res, next) => {
  const cancelOpinionMessage = { message: 'Ton avis a bien été annulé' };
  const successOpinionMessage = { message: 'Ton avis a été pris en compte!' };
  const fordiddenRepetitionMessage = { message: 'Vote deja pris en compte, annule ton vote pour changer' };
  const pushDislike = { usersDisliked: req.body.userId };
  const pushLike = { usersLiked: req.body.userId };
  try {
    const currentSauce = await SauceModel.findOne({ _id: req.params.id });
    switch (req.body.like) {
      case 0:
        if (currentSauce.usersLiked.includes(req.body.userId)) {
          deleteOpinion({ likes: -1 }, pushLike);
        } else if (currentSauce.usersDisliked.includes(req.body.userId)) {
          deleteOpinion({ dislikes: -1 }, pushDislike);
        } else {
          responseBadRequest(res, badRequestMessage);
        }
        break;
      case 1:
        if (
          !currentSauce.usersLiked.includes(req.body.userId) &&
          !currentSauce.usersDisliked.includes(req.body.userId)
        ) {
          addOpinion({ likes: +1 }, pushLike);
        } else {
          responseBadRequest(res, badRequestMessage);
        }
        break;
      case -1:
        if (
          !currentSauce.usersLiked.includes(req.body.userId) &&
          !currentSauce.usersDisliked.includes(req.body.userId)
        ) {
          addOpinion({ dislikes: +1 }, pushDislike);
        } else {
          responseBadRequest(res, fordiddenRepetitionMessage);
        }
        break;
      default:
        console.log('Tentative de contournement de la requete like');
        responseBadRequest(res, badRequestMessage);
        break;
    }
  } catch (error) {
    console.log('Cannot get OneSauce', error);
    responseBadRequest(res, fordiddenRepetitionMessage);
  }
  function addOpinion (increment, likeOrDislike) {
    SauceModel.updateOne(
      { _id: req.params.id },
      {
        $inc: increment,
        $push: likeOrDislike
      }
    )
      .then(() => res
        .status(httpStatus.OK)
        .json(successOpinionMessage))
      .catch(() => responseBadRequest(res, fordiddenRepetitionMessage));
  }
  function deleteOpinion (increment, likeOrDislike) {
    SauceModel.updateOne(
      { _id: req.params.id },
      {
        $inc: increment,
        $pull: likeOrDislike
      }
    )
      .then(() => res
        .status(httpStatus.OK)
        .json(cancelOpinionMessage))
      .catch(() => responseBadRequest(res, badRequestMessage));
  }
};
