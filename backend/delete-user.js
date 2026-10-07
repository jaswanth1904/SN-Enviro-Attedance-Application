const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

const deleteJaswanth = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const result = await User.deleteOne({ email: 'jaswanth@snenviro.in' });
        console.log('Deleted jaswanth@snenviro.in:', result.deletedCount > 0 ? 'Success' : 'Not found');
        process.exit();
    } catch(e) {
        console.error(e);
        process.exit(1);
    }
};

deleteJaswanth();
