const express = require('express');
const router = express.Router();

const userControllers = require('../controllers/user');
const user = require('../middleware/validUser');

router.post('/signup', user.userSignupValidation, userControllers.signup);
router.post('/login', user.userLoginValidation, userControllers.login);

module.exports = router;
