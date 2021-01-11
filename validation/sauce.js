
const { EXPECTATION_FAILED } = require('http-status');
const Joi = require('joi');
const fs = require('fs');
module.exports = async (req, res, next) => {
  const sauce = req.body.sauce;
  const sauceObject = JSON.parse(sauce);
  const joiSchema = Joi.object({
    userId: Joi.string().alphanum().required(),
    name: Joi.string().max(12).required(),
    manufacturer: Joi.string().required(),
    description: Joi.string().required(),
    mainPepper: Joi.string().required(),
    imageUrl: Joi.string(),
    heat: Joi.number().required(),
    likes: Joi.number().default(0), // { type: Number, required: false, default: 0 },
    dislikes: Joi.number().default(0), // { type: Number, required: false, default: 0 },
    usersLiked: Joi.array(), // [{ type: String, required: false }],
    usersDisliked: Joi.array() // [{ type: String, required: false }],
  });
  try {
    const valid = await joiSchema.validateAsync(sauceObject, { abortEarly: false });
    next();
  } catch (error) {
    fs.unlink(`images/${req.file.filename}`, (err) => {
      if (err) throw err;
      console.log(`${req.file.filename} was deleted`);
    });
    const errorMessage = [];
    console.log(error.annotate());
    error.details.forEach((element) => {
      errorMessage.push(element.message);
    });
    res.status(EXPECTATION_FAILED).json(errorMessage);
  }
};
