const Sauce = require('../models/sauce');
const fs = require('fs');
const httpStatus = require('http-status');
const badRequestMessage = { message: 'Requete non autorisée' };
const internalServerErrorMessage = { message: 'internal Server Error' };

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
    fs.unlink(`images/${req.file.filename}`, (err) => {
      if (err) throw err;
      console.log(`${req.file.filename} was deleted`);
    });
  }
};

exports.modifySauce = async (req, res, next) => {
  if (req.file && req.body.sauce) {


    const sauce = await Sauce.findOne({ _id: req.params.id });
    const filename = sauce.imageUrl.split('/images/')[1];


    fs.unlink(`images/${filename}`, () => {
      console.log('Suppression fichier effectuée!');
    });

    const sauceObject = {
      ...JSON.parse(req.body.sauce),
      imageUrl: `${req.protocol}://${req.get('host')}/images/${
       req.file.filename
     }`
    };


    await Sauce.updateOne(
      { _id: req.params.id },
      { ...sauceObject, _id: req.params.id }
    );


    res.status(httpStatus.OK).json({ message: 'Objet modifié!' });

  } else if (req.file && !req.body.sauce)
  {
    const sauce = await Sauce.findOne({ _id: req.params.id });
    const filename = sauce.imageUrl.split('/images/')[1];

    fs.unlink(`images/${filename}`, () => {
      console.log('Suppression fichier effectuée!');
    });

    const sauceObject = {
      imageUrl: `${req.protocol}://${req.get('host')}/images/${
       req.file.filename
     }`
    };

    await Sauce.updateOne(
      { _id: req.params.id },
      { ...sauceObject, _id: req.params.id }
    );

    res.status(httpStatus.OK).json({ message: 'Objet modifié!' });

  } else if (!req.file && req.body.sauce) {

    const sauceObject = JSON.parse(req.body.sauce);

    await Sauce.updateOne(
      { _id: req.params.id },
      { ...sauceObject, _id: req.params.id }
    );

    res.status(httpStatus.OK).json({ message: 'Objet modifié!' });

  } else if (!req.file && !req.body.sauce) {
    await Sauce.updateOne(
      { _id: req.params.id },
      { ...sauceObject, _id: req.params.id }
    );

    res.status(httpStatus.OK).json({ message: "Objet modifié!" });
  }

};

exports.deleteSauce = async (req, res, next) => {
  try {
    const sauce = await Sauce.findOne({ _id: req.params.id });
    const filename = sauce.imageUrl.split('/images/')[1];
    fs.unlink(`images/${filename}`, async () => {
      try {
        await Sauce.deleteOne({ _id: req.params.id });
        res.status(httpStatus.OK).json({ Message: 'Objet supprimé !' });
      } catch (error) {
        console.log(error);
        res.status(httpStatus.BAD_REQUEST).json(badRequestMessage);
      }
    });
  } catch (error) {
    console.log(error.message);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json(internalServerErrorMessage);
  }
};

exports.getOneSauce = async (req, res, next) => {
  try {
    const oneSauce = await Sauce.findOne();
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
