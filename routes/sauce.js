const express = require('express');
const router = express.Router();
const sauceControllers = require('../controllers/sauce');
const auth = require('../middleware/auth');
const multer = require('../middleware/multer.config');
const datavalid = require('../middleware/validSauce');

router.post('/', auth, multer, datavalid.validSauce, sauceControllers.createSauce);
router.post('/:id/like', auth, sauceControllers.likeSauce);
router.put('/:id', auth, multer, datavalid.validSauce, sauceControllers.modifySauce);
router.delete('/:id', auth, sauceControllers.deleteSauce);
router.get('/:id', auth, sauceControllers.getOneSauce);
router.get('/', auth, sauceControllers.getAllSauce);

module.exports = router;
