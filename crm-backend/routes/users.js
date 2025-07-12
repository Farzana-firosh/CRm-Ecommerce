const express = require('express');
const router = express.Router();
const asyncHandler = require('../middlewares/asyncHandler');
const { createUser, login, getAllUsers, getUserById, updateUser, deleteUser, getAllRoles } = require('../controllers/users');
const { verifyTokenHandler, verifyRoles } = require('../middlewares/jwtTokenHandler');

// Public routes
router.post('/', asyncHandler(createUser));
router.post('/login', asyncHandler(login));

// Protected routes
router.get('/', verifyTokenHandler, asyncHandler(getAllUsers));
router.get('/roles', verifyTokenHandler, asyncHandler(getAllRoles));
router.get('/:id', verifyTokenHandler, asyncHandler(getUserById));
router.put('/:id', verifyTokenHandler, verifyRoles(['Admin']), asyncHandler(updateUser));
router.delete('/:id', verifyTokenHandler, verifyRoles(['Admin']), asyncHandler(deleteUser));

router.get('/admin-only', verifyTokenHandler, verifyRoles(['Admin']), (req, res) => {
  res.json({ message: 'Welcome Admin!' });
});

module.exports = router;