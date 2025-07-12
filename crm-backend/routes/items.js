const express = require('express');
const router = express.Router();
const itemsController = require('../controllers/items');
const { verifyTokenHandler, verifyRoles } = require('../middlewares/jwtTokenHandler');

router.use(verifyTokenHandler); // All routes below require token

router.get('/', itemsController.getAll);
router.post('/', verifyRoles(['Admin']), itemsController.create);
router.get('/:id', itemsController.getOne);
router.put('/:id', verifyRoles(['Admin']), itemsController.update);
router.delete('/:id', verifyRoles(['Admin']), itemsController.remove);

module.exports = router;