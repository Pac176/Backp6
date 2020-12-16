const Sauce = require('../models/sauce');

exports.createSauce = (req, res, next) => {
  delete req.body._id;
  const sauce = new Sauce({
    ...req.body
  });
  sauce.save()
    .then(() => res.status(201).json({ message: 'Objet enregistré !'}))
    .catch(error => res.status(400).json({ error }));
}


exports.modifySauce = (req, res, next) => {
  Sauce.updateOne({ _id: req.params.id }, { ...req.body, _id: req.params.id })
    .then(() => res.status(200).json({ message: 'Objet modifié !'}))
    .catch(error => res.status(400).json({ error }));
}

exports.deleteSauce = (req, res, next) => {
  Sauce.deleteOne({ _id: req.params.id })
    .then(() => res.status(200).json({ message: 'Objet supprimé !'}))
    .catch(error => res.status(400).json({ error }));
}

exports.getOneSauce = (req, res, next) => {
  Sauce.findOne()
    .then(things => res.status(200).json(things))
    .catch(error => res.status(400).json({ error }));
}
exports.getAllSauce = (req, res, next) => {
  Sauce.find()
    .then(things => res.status(200).json(things))
    .catch(error => res.status(400).json({ error }));
}



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
