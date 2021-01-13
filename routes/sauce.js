const express = require('express');
const router = express.Router();
const sauceControllers = require('../controllers/sauce');
const auth = require('../middleware/auth');
const multer = require('../middleware/multer.config');
const datavalid = require('../validation/sauce');

router.post('/', auth, multer, datavalid.validNewSauce, sauceControllers.createSauce);
router.post('/:id/like', auth, sauceControllers.likeSauce);
router.put('/:id', auth, multer, /* datavalid.validUpdateSauce, */sauceControllers.modifySauce);
router.delete('/:id', auth, sauceControllers.deleteSauce);
router.get('/:id', auth, sauceControllers.getOneSauce);
router.get('/', auth, sauceControllers.getAllSauce);

module.exports = router;
