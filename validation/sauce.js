

const { ValidationError } = require('joi');
const Joi = require('joi');

module.exports = (req, res, next) => {
 
  const joiSchema = Joi.object({
    userId: Joi.string().min(30).required(),
    name: Joi.string().min(50).required(),
    manufacturer: Joi.string().required(),
    description: Joi.string().min(15).required(),
    mainPepper: Joi.string().min(15).required(),
    imageUrl: Joi.string().required(),
    heat: Joi.number().required(),
    likes: Joi.number().default(0), // { type: Number, required: false, default: 0 },
    dislikes: Joi.number().default(0), // { type: Number, required: false, default: 0 },
    usersLiked: Joi.array(), // [{ type: String, required: false }],
    usersDisliked: Joi.array(), // [{ type: String, required: false }],
    });
  const sauce = req.body.sauce;
  const sauceObject = JSON.parse(sauce)

  const { value, error } = joiSchema.validate(sauceObject, { abortEarly: false });
  


 next();
};
