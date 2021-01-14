
const { EXPECTATION_FAILED } = require('http-status');
const Joi = require('joi');
const fs = require('fs');

exports.validSauce = async (req, res, next) => {
  if (req.file) {
    const sauceObject = JSON.parse(req.body.sauce);
    const joiSchema = Joi.object({
      userId: Joi.string().alphanum().required(),
      name: Joi.string().required(),
      manufacturer: Joi.string().required(),
      description: Joi.string().required(),
      mainPepper: Joi.string().required(),
      imageUrl: Joi.string(),
      heat: Joi.number().required(),
      likes: Joi.number().default(0), // { type: Number, required: false, default: 0 },
      dislikes: Joi.number().default(0), // { type: Number, required: false, default: 0 },
      usersLiked: Joi.array(), // [{ type: String, required: false }],
      usersDisliked: Joi.array(), // [{ type: String, required: false }],
    });
    try {
      await joiSchema.validateAsync(sauceObject, {
        abortEarly: false,
      });
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
  }
  else if (!req.file) {
    const joiSchema = Joi.object({
      userId: Joi.string().alphanum(),
      name: Joi.string().min(10),
      manufacturer: Joi.string(),
      description: Joi.string(),
      mainPepper: Joi.string(),
      imageUrl: Joi.string(),
      heat: Joi.number(),
   
    });
    try {
      await joiSchema.validateAsync(req.body, {
        abortEarly: false,
      });
      next();
    } catch (error) {
      const errorMessage = [];
      console.log(error.annotate());
      error.details.forEach((element) => {
        errorMessage.push(element.message);
      });
      res.status(EXPECTATION_FAILED).json(errorMessage);
    }
  }
}