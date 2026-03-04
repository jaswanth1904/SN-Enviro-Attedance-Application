const errorHandler = (err, req, res, next) => {
    let error;

    // Handle if err is just a string
    if (typeof err === 'string') {
        error = { message: err };
    } else {
        error = { ...err };
        error.message = err.message;
    }

    // Log to console for dev
    console.error('--- ERROR LOG START ---');
    console.error(err);
    console.error('--- ERROR LOG END ---');

    // Mongoose bad ObjectId
    if (err.name === 'CastError') {
        const message = `Resource not found with id of ${err.value}`;
        error = { message, statusCode: 404 };
    }

    // Mongoose duplicate key
    if (err.code === 11000) {
        const field = Object.keys(err.keyValue)[0];
        const message = `${field === 'phoneNumber' ? 'Phone number' : field.charAt(0).toUpperCase() + field.slice(1)} already exists`;
        error = { message, statusCode: 400 };
    }

    // Mongoose validation error
    if (err.name === 'ValidationError') {
        const message = Object.values(err.errors).map(val => val.message);
        error = { message, statusCode: 400 };
    }

    res.status(error.statusCode || 500).json({
        success: false,
        error: error.message || 'Server Error'
    });
};

module.exports = errorHandler;
