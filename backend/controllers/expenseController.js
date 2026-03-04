const Expense = require('../models/Expense');

// @desc    Upload expense bill
// @route   POST /api/expenses/upload
// @access  Private (All Roles)
exports.uploadExpense = async (req, res, next) => {
    try {
        const { amount, description } = req.body;

        if (!req.file) {
            return res.status(400).json({
                success: false,
                error: 'Please upload a bill image'
            });
        }

        // Generate full URL for the image
        const protocol = req.protocol;
        const host = req.get('host');
        const fileUrl = `${protocol}://${host}/uploads/${req.file.filename}`;

        const expense = await Expense.create({
            user: req.user.id,
            amount,
            description,
            billImageUrl: fileUrl, // Full URL to view the image
            status: 'Pending'
        });

        res.status(201).json({
            success: true,
            data: expense
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get pending expenses (Accountant/Admin only)
// @route   GET /api/expenses/pending
// @access  Private (Accountant/Admin)
exports.getPendingExpenses = async (req, res, next) => {
    try {
        const expenses = await Expense.find({ status: 'Pending' })
            .populate('user', 'name email')
            .sort('-submittedAt');

        res.status(200).json({
            success: true,
            count: expenses.length,
            data: expenses
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Process expense (Approve/Reject)
// @route   PUT /api/expenses/:id
// @access  Private (Accountant/Admin)
exports.processExpense = async (req, res, next) => {
    try {
        const { status } = req.body;

        if (!['Approved', 'Rejected'].includes(status)) {
            return res.status(400).json({
                success: false,
                error: 'Please provide a valid status (Approved or Rejected)'
            });
        }

        let expense = await Expense.findById(req.params.id);

        if (!expense) {
            return res.status(404).json({
                success: false,
                error: 'Expense not found'
            });
        }

        expense.status = status;
        expense.processedAt = Date.now();
        expense.processedBy = req.user.id;

        await expense.save();

        res.status(200).json({
            success: true,
            data: expense
        });
    } catch (error) {
        next(error);
    }
};
