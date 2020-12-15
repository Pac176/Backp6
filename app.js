const express = require('express');
const bodyParser = require('body-parser');

const mongoose = require('mongoose');
const app = express();

mongoose.connect('mongodb+srv://Pascal:openclasserooms@cluster0.boxdf.mongodb.net/Sauces?retryWrites=true&w=majority',
  { useNewUrlParser: true,
    useUnifiedTopology: true })
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
  console.log(req.body);
  res.status(201).json({
    message: 'Objet créé !'
  });
});

app.use('/api/sauces', (req, res, next) => {
  const sauces = [
    {
      userId: 'Mon premier objet',
      name: 'Les infos de mon premier objet',
      imageUrl: 'https://cdn.pixabay.com/photo/2019/06/11/18/56/camera-4267692_1280.jpg',
      manufacturer: 'heinz',
      description: 'qsomihvqios',
      mainPepper: '',
      imageUrl: '',
      heat: 2,
      likes: 20,
      dislikes: 2,
      usersLiked: [''],
      usersDisliked: ['']
    }
  ];
  res.status(200).json(sauces);
});

module.exports = app;
