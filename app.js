const express = require('express');
const bodyParser = require('body-parser');
const saucesRoutes = require('./routes/sauce')
const userRoutes = require('./routes/user');
const mongoose = require('mongoose');
const app = express();
const path = require('path');
require('dotenv').config();
const helmet = require('helmet');


mongoose.connect(process.env.DB_CONNECT_USER, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
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

app.use(helmet());

app.use('/images', express.static(path.join(__dirname, 'images')));

app.use('/api/sauces', saucesRoutes)

app.use('/api/auth', userRoutes)

module.exports = app