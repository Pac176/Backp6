const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');
const Joigoose = require("joigoose")(mongoose);
const Joi = require('joi')


const joiSchema = Joi.object().keys({
  email: Joi.string()
    //.regex(/^\w+[\w-\.]*\@\w+((-\w+)|(\w*))\.[a-z]{2,3}$/)
    .required(),
  password: Joi.string().required()
});

const userSchema = new mongoose.Schema(Joigoose.convert(joiSchema));






// const userSchema = mongoose.Schema({
//   email: { type: String, required: true, unique: true },
//   password: { type: String, required: true }
// });

userSchema.plugin(uniqueValidator);

module.exports = mongoose.model('User', userSchema);
