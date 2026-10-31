const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const User = require('./models/User');
const Attendance = require('./models/Attendance');
const Leave = require('./models/Leave');

async function updateEmployeeEmail(oldEmail, newEmail) {
    if (!oldEmail || !newEmail) {
        console.log('\n❌ Usage: node update-email.js <old-email> <new-email>');
        console.log('   Example: node update-email.js vineet.snenviro@gmail.com vineet@snenviro.in\n');
        process.exit(1);
    }

    const cleanOld = oldEmail.toLowerCase().trim();
    const cleanNew = newEmail.toLowerCase().trim();

    try {
        console.log('Connecting to database...');
        await mongoose.connect(process.env.MONGO_URI);

        // 1. Check if the employee with old email exists
        const user = await User.findOne({ email: cleanOld });
        if (!user) {
            console.log(`\n❌ Error: No employee found with old email: "${cleanOld}"`);
            process.exit(1);
        }

        // 2. Check if the new email is already in use
        const existingTarget = await User.findOne({ email: cleanNew });
        if (existingTarget) {
            console.log(`\n❌ Error: The new email "${cleanNew}" is already registered by "${existingTarget.name}"!`);
            process.exit(1);
        }

        // 3. Count historical records to verify preservation
        const attCount = await Attendance.countDocuments({ user: user._id });
        const leaveCount = await Leave.countDocuments({ user: user._id });

        // 4. Update the email in-place
        user.email = cleanNew;
        await user.save({ validateModifiedOnly: true });

        console.log('\n========================================================');
        console.log('✅ EMPLOYEE EMAIL SUCCESSFULLY UPDATED');
        console.log('========================================================');
        console.log(`• Employee Name     : ${user.name}`);
        console.log(`• Role              : ${user.role}`);
        console.log(`• Old Email         : ${cleanOld}`);
        console.log(`• New Login Email   : ${cleanNew}`);
        console.log(`• Password          : PRESERVED (Unchanged)`);
        console.log(`• Attendance History: ${attCount} records preserved 100%`);
        console.log(`• Leave History     : ${leaveCount} records preserved 100%`);
        console.log('========================================================\n');

        await mongoose.disconnect();
        process.exit(0);
    } catch (err) {
        console.error('\n❌ Update Failed:', err.message);
        await mongoose.disconnect();
        process.exit(1);
    }
}

const args = process.argv.slice(2);
updateEmployeeEmail(args[0], args[1]);
