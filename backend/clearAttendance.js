const mongoose = require('mongoose');
const Attendance = require('./models/Attendance');
require('dotenv').config();

const clearDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb+srv://jaswanthkorrapati1904:R1XvS6L03E7UtdgW@cluster0.n185q.mongodb.net/sn_enviro?retryWrites=true&w=majority', {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('Connected to DB');

        const result = await Attendance.deleteMany({});
        console.log(`Deleted ${result.deletedCount} attendance records.`);

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

clearDB();
