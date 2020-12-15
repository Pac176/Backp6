const express = require('express');
const bodyParser = require('body-parser');
const Sauce = require('./models/sauce');
const mongoose = require('mongoose');
const app = express();

mongoose.connect('mongodb+srv://Pascal:openclasserooms@cluster0.boxdf.mongodb.net/soPeckoko?retryWrites=true&w=majority',
  {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => console.log('Connexion à MongoDB réussie !'))
  .catch(() => console.log('Connexion à MongoDB échouée !'));

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  next();
});

app.use(bodyParser.json());

app.post('/api/sauces', (req, res, next) => {
  delete req.body._id;
  const sauce = new Sauce({
    userId: "test sauce",
  name: "test sauce",
  imageUrl: "test sauce",
  manufacturer: "test sauce",
  description: "test sauce",
  mainPepper: "test sauce",
  imageUrl: "test sauce",
  heat: 1,
  likes: 1,
  dislikes: 1,
  usersLiked: ["test sauce"],
  usersDisliked: ["test sauce"]
  });
  sauce.save()
    .then(() => res.status(201).json({ message: 'Objet enregistré !'}))
    .catch(error => res.status(400).json({ error }));
});

app.use('/api/sauces', (req, res, next) => {
  Sauce.find()
    .then(things => res.status(200).json(things))
    .catch(error => res.status(400).json({ error }));
});

module.exports = app;
