const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

const updatePassword = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });

        const email = 'jaswanth@snenviro.in';
        let user = await User.findOne({ email });

        if (!user) {
            console.log(`User ${email} not found. Creating a new admin user...`);
            user = await User.create({
                name: 'Jaswanth',
                email: email,
                password: 'password123',
                role: 'Admin',
                empId: 'SN-001'
            });
            console.log(`Created user ${email} with password: password123`);
        } else {
            user.password = 'password123';
            await user.save();
            console.log(`Successfully reset password for ${email} to: password123`);
        }

        process.exit();
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
};

updatePassword();
