const express = require('express');
const { getUsers, updateUser, deleteUser } = require('../controllers/userController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);
router.use(authorize('Admin', 'Application Engineer'));

router.route('/')
    .get(getUsers);

router.route('/:id')
    .put(updateUser)
    .delete(deleteUser);

module.exports = router;
