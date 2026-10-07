const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

const checkRoles = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const users = await User.find({ email: { $in: ['md@snenviro.in', 'engineer@snenviro.in'] } });
        console.log("Users in DB:");
        users.forEach(u => console.log(`${u.email} -> ${u.role}`));
        process.exit();
    } catch(e) {
        console.error(e);
        process.exit(1);
    }
};

checkRoles();
