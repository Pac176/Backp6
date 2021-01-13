const express = require('express');
const router = express.Router();

const userControllers = require('../controllers/user');
const user = require('../validator/user');

router.post('/signup', user.userSignupValidation, userControllers.signup);
router.post('/login', user.userLoginValidation, userControllers.login);

module.exports = router;
