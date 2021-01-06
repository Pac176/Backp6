
const { EXPECTATION_FAILED } = require('http-status');
const httpStatus = require('http-status');
const Joi = require('joi');

module.exports = async (req, res, next) => {
  const sauce = req.body.sauce;
  const sauceObject = JSON.parse(sauce);
  const joiSchema = Joi.object({
    userId: Joi.string().alphanum().min(30).required(),
    name: Joi.string().max(12).required(),
    manufacturer: Joi.string().regex(/manufacturer/).required(),
    description: Joi.string().min(15).required(),
    mainPepper: Joi.string().min(15).required(),
    imageUrl: Joi.string().required(),
    heat: Joi.number().required(),
    likes: Joi.number().default(0), // { type: Number, required: false, default: 0 },
    dislikes: Joi.number().default(0), // { type: Number, required: false, default: 0 },
    usersLiked: Joi.array().length(5), // [{ type: String, required: false }],
    usersDisliked: Joi.array() // [{ type: String, required: false }],
  });

  try {
    const value = await joiSchema.validateAsync(sauceObject, { abortEarly: false });
    next();
  } catch (error) {
    const errorMessage = [];
    console.log(error.annotate());
    error.details.forEach((element) => {
      errorMessage.push(element.message);
    });
    res.status(EXPECTATION_FAILED).json(errorMessage);
  }
};
