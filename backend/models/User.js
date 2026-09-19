const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a name'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'Please add an email'],
        unique: true,
        lowercase: true,
        match: [
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            'Please add a valid email'
        ]
    },
    password: {
        type: String,
        required: [true, 'Please add a password'],
        minlength: 6,
        select: false
    },
    empId: {
        type: String,
        trim: true,
        default: ''
    },
    role: {
        type: String,
        default: 'Staff'
    },
    phoneNumber: {
        type: String,
        unique: true,
        sparse: true,
        match: [/^\d{10,15}$/, 'Please add a valid phone number (10-15 digits)']
    },
    alternativeContact: {
        type: String,
        match: [/^\d{10,15}$/, 'Please add a valid phone number (10-15 digits)']
    },
    bloodGroup: {
        type: String,
        enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', '', null]
    },
    profilePicture: {
        type: String,
        default: 'default-profile.png'
    },
    joiningDate: {
        type: Date
    },
    employmentType: {
        type: String,
        enum: ['Full-time', 'Part-time', 'Contract', 'Intern', '', null]
    },
    gradeLevel: {
        type: String,
        trim: true
    },
    socialLinks: {
        type: String,
        trim: true
    },
    homeAddress: {
        type: String,
        trim: true
    },
    coreCompetencies: {
        type: String,
        trim: true
    },
    currentProjects: {
        type: String,
        trim: true
    },
    department: {
        type: mongoose.Schema.ObjectId,
        ref: 'Department'
    },
    site: {
        type: mongoose.Schema.ObjectId,
        ref: 'Site'
    },
    pushSubscription: {
        type: Object,
        default: null
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Encrypt password using bcrypt
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
