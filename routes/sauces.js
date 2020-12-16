const express = require('express');
const router = express.Router();
const sauceControllers = require('../controllers/sauces');





router.post('/', sauceControllers.createSauce );
router.put('/:id', sauceControllers.modifySauce);
router.delete('/:id', sauceControllers.deleteSauce);
router.get('/:id', sauceControllers.getOneSauce);
router.get('/', sauceControllers.getAllSauce);



module.exports = router;


