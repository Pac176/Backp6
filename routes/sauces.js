const express = require('express');
const Sauce = require('../models/sauce');
const router = express.Router();






router.post('/', (req, res, next) => {
  delete req.body._id;
  const sauce = new Sauce({
    ...req.body
  });
  sauce.save()
    .then(() => res.status(201).json({ message: 'Objet enregistré !'}))
    .catch(error => res.status(400).json({ error }));
});

router.put('/:id', (req, res, next) => {
  Sauce.updateOne({ _id: req.params.id }, { ...req.body, _id: req.params.id })
    .then(() => res.status(200).json({ message: 'Objet modifié !'}))
    .catch(error => res.status(400).json({ error }));
});

router.delete('/:id', (req, res, next) => {
  Sauce.deleteOne({ _id: req.params.id })
    .then(() => res.status(200).json({ message: 'Objet supprimé !'}))
    .catch(error => res.status(400).json({ error }));
});

router.get('/', (req, res, next) => {
  Sauce.find()
    .then(things => res.status(200).json(things))
    .catch(error => res.status(400).json({ error }));
});



module.exports = router;



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
