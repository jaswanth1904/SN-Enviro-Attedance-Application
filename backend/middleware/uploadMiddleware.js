const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists
const uploadDir = 'uploads';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

// Set storage engine
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        // Create unique filename: fieldname-timestamp.extension
        cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
    }
});

// Check file type for images
function checkFileType(file, cb) {
    // Allowed ext
    const filetypes = /jpeg|jpg|png|webp|bmp/;
    // Check ext
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    // Check mime
    const mimetype = filetypes.test(file.mimetype);

    if (mimetype && extname) {
        return cb(null, true);
    } else {
        const err = new Error('Error: Invalid file type. Only JPEG, JPG, PNG, WEBP, and BMP are allowed!');
        err.statusCode = 400;
        return cb(err);
    }
}

// Check file type for CSV/Excel
function checkCsvFileType(file, cb) {
    const filetypes = /csv|xlsx|xls/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

    // Some CSVs might have different mimetypes depending on OS, so extension check is safer
    if (extname) {
        return cb(null, true);
    } else {
        const err = new Error('Error: Invalid file type. Only CSV and Excel files are allowed!');
        err.statusCode = 400;
        return cb(err);
    }
}

// Init upload for images
const upload = multer({
    storage: storage,
    limits: { fileSize: 10000000 }, // 10MB limit
    fileFilter: function (req, file, cb) {
        checkFileType(file, cb);
    }
});

// Init upload for CSV
const csvUpload = multer({
    storage: storage,
    limits: { fileSize: 5000000 }, // 5MB limit
    fileFilter: function (req, file, cb) {
        checkCsvFileType(file, cb);
    }
});

module.exports = { upload, csvUpload };
