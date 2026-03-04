const express = require('express');
const {
    uploadExpense,
    getPendingExpenses,
    processExpense
} = require('../controllers/expenseController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { upload } = require('../middleware/uploadMiddleware');

const router = express.Router();

router.post('/upload', protect, upload.single('bill'), uploadExpense);
router.get('/pending', protect, authorize('Accountant', 'Admin'), getPendingExpenses);
router.put('/:id', protect, authorize('Accountant', 'Admin'), processExpense);

module.exports = router;
