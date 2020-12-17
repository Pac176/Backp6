const Sauce = require('../models/sauce');
const fs = require('fs');

exports.createSauce = (req, res, next) => {
  const sauceObject = JSON.parse(req.body.sauce);
  delete sauceObject._id;
  const sauce = new Sauce({
    ...sauceObject,
    imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
  });
  sauce.save()
    .then(() => res.status(201).json({ message: 'Objet enregistré !' }))
    .catch(error => res.status(400).json({ error }));
};

exports.modifySauce = (req, res, next) => {
  const sauceObject = req.file ?
    {
      ...JSON.parse(req.body.sauce),
      imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    } : { ...req.body };
  Sauce.updateOne({ _id: req.params.id }, { ...sauceObject, _id: req.params.id })
    .then(() => res.status(200).json({ message: 'Objet modifié !' }))
    .catch(error => res.status(400).json({ error }));
};

exports.deleteSauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id })
    .then(Sauce => {
      const filename = sauce.imageUrl.split('/images/')[1];
      fs.unlink(`images/${filename}`, () => {
        Sauce.deleteOne({ _id: req.params.id })
          .then(() => res.status(200).json({ message: 'Objet supprimé !'}))
          .catch(error => res.status(400).json({ error }));
      });
    })
    .catch(error => res.status(500).json({ error }));
};

exports.getOneSauce = (req, res, next) => {
  Sauce.findOne()
    .then(sauces => res.status(200).json(sauces))
    .catch(error => res.status(400).json({ error }));
};
exports.getAllSauce = (req, res, next) => {
  Sauce.find()
    .then(sauces => res.status(200).json(sauces))
    .catch(error => res.status(400).json({ error }));
};

// const saucetest = {

//   userId: 'sauce test',
//   name: 'sauce test',
//   imageUrl: 'sauce test',
//   manufacturer: 'sauce test',
//   description: 'sauce test',
//   mainPepper: 'sauce test',
//   imageUrl: 'sauce test',
//   heat: 1,
//   likes: 1,
//   dislikes: 1,
//   usersLiked: ['sauce test'],
//   usersDisliked: ['sauce test']
// }
// const saucetestModfiée = {

//   userId: 'sauce test',
//   name: 'sauce test',
//   imageUrl: 'sauce test',
//   manufacturer: 'sauce test',
//   description: 'sauce modifiée',
//   mainPepper: 'sauce test',
//   imageUrl: 'sauce test',
//   heat: 1,
//   likes: 1,
//   dislikes: 1,
//   usersLiked: ['sauce test'],
//   usersDisliked: ['sauce test']
// }
