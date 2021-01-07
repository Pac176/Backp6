const { EXPECTATION_FAILED } = require('http-status');
const httpStatus = require('http-status');
const Joi = require('joi');

exports.userSignupValidation = async (req, res, next) => {
  const joiSchema = Joi.object({
    email: Joi.string()
      .regex(/^\w+[\w-\.]*\@\w+((-\w+)|(\w*))\.[a-z]{2,3}$/).required(),
    password: Joi.string()
      .regex(/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/).min(8).required()
  });
  try {
    await joiSchema.validateAsync(req.body, {
      abortEarly: false
    });
    next();
  } catch (error) {
    const errorMessage = [];
    console.log(error.annotate());
    error.details.forEach((element) => {
      errorMessage.push(element.message);
    });
    res.status(EXPECTATION_FAILED).json({ message: 'Les champs ne sont pas valides, veuillez rentrer un email valide sous la forme xxxxx@xxxx.xx et un mot de passe fort( min 8 lettres avec au moins 1 Majuscule, 1 chiffre et un caractere special', detail: errorMessage });
  }
};

exports.userLoginValidation = async (req, res, next) => {
  const joiSchema = Joi.object({
    email: Joi.string()
      .regex(/^\w+[\w-\.]*\@\w+((-\w+)|(\w*))\.[a-z]{2,3}$/)
      .required(),
    password: Joi.string()
      .regex(/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/)
      .min(8)
      .required()
  });
  try {
    await joiSchema.validateAsync(req.body, {
      abortEarly: false
    });
    next();
  } catch (error) {
    res.status(httpStatus.IM_A_TEAPOT).json({
      message:
          'Take a cup of tea and try again'
    });
  }
};
