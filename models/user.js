const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

const userSchema = mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }
});

userSchema.plugin(uniqueValidator, {
  message: 'Un utilisateur a deja rentré cet email'

});

module.exports = mongoose.model('User', userSchema);
