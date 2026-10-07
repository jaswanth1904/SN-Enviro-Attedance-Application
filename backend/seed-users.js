const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

const fixUsers = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        // Delete the previous test accounts just to be completely clean
        await User.deleteMany({ email: { $in: ['md@snenviro.in', 'engineer@snenviro.in'] } });
        console.log('Removed old test accounts from database.');

        // Recreate them with the CORRECT roles
        const users = [
            { 
                email: 'md@snenviro.in', 
                name: 'Managing Director', 
                password: 'password123', 
                role: 'Admin', // Admin goes to /admin
                empId: 'MD-001' 
            },
            { 
                email: 'engineer@snenviro.in', 
                name: 'Field Engineer', 
                password: 'password123', 
                role: 'Service Engineer', // Service Engineer goes to /dashboard
                empId: 'ENG-001' 
            }
        ];

        for (const u of users) {
            await User.create(u);
            console.log(`Successfully created ${u.role}: ${u.email}`);
        }
        
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

fixUsers();
