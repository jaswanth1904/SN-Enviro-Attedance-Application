const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

// Models
const User = require('./models/User');
const Attendance = require('./models/Attendance');
const Site = require('./models/Site');
const Department = require('./models/Department');
const Leave = require('./models/Leave');
const Announcement = require('./models/Announcement');
const Notification = require('./models/Notification');

dotenv.config();

const connectDB = async () => {
    try {
        const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/sn-enviro';
        await mongoose.connect(uri);
        console.log('MongoDB connected for seeding...');
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

const seedData = async () => {
    try {
        await connectDB();

        // Clear existing data
        await User.deleteMany();
        await Attendance.deleteMany();
        await Site.deleteMany();
        await Department.deleteMany();
        await Leave.deleteMany();
        await Announcement.deleteMany();
        await Notification.deleteMany();

        console.log('Old data cleared.');

        // 1. Create Departments
        const d1 = await Department.create({ name: 'Field Operations', description: 'Engineers on the field' });
        const d2 = await Department.create({ name: 'Engineering', description: 'App and backend developers' });
        const d3 = await Department.create({ name: 'HR', description: 'Human resources' });

        // 2. Create Sites
        const s1 = await Site.create({ name: 'Mumbai Site A', location: { coordinates: [72.8777, 19.0760] } });
        const s2 = await Site.create({ name: 'Ahmedabad Plant', location: { coordinates: [72.5714, 23.0225] } });
        const s3 = await Site.create({ name: 'HQ', location: { coordinates: [77.1025, 28.7041] } });

        // 3. Create Users
        const salt = await bcrypt.genSalt(10);
        const password = await bcrypt.hash('password123', salt);

        const users = await User.create([
            { name: 'Rahul Sharma', email: 'rahul@snenviro.com', password: password, role: 'Service Engineer', department: d1._id, site: s1._id, phoneNumber: '9876543210' },
            { name: 'Priya Patel', email: 'priya@snenviro.com', password: password, role: 'Application Engineer', department: d2._id, site: s2._id, phoneNumber: '9876543211' },
            { name: 'Sanjay Kumar', email: 'sanjay@snenviro.com', password: password, role: 'Office Employee', department: d3._id, site: s3._id, phoneNumber: '9876543212' },
            { name: 'Anjali Desai', email: 'anjali@snenviro.com', password: password, role: 'Admin', department: d3._id, site: s3._id, phoneNumber: '9876543213' }
        ]);

        // 4. Create Attendance
        const now = new Date();
        await Attendance.create([
            { user: users[0]._id, timestamp: new Date(now.getTime() - 2 * 60 * 60 * 1000), locationName: 'Mumbai Site A', location: { coordinates: [72.8777, 19.0760] }, status: 'Present' },
            { user: users[1]._id, timestamp: new Date(now.getTime() - 4 * 60 * 60 * 1000), locationName: 'Ahmedabad Plant', location: { coordinates: [72.5714, 23.0225] }, status: 'Late' },
            { user: users[2]._id, timestamp: new Date(now.getTime() - 24 * 60 * 60 * 1000), locationName: 'HQ', location: { coordinates: [77.1025, 28.7041] }, status: 'Absent' }
        ]);

        // 5. Create Leave
        await Leave.create([
            { user: users[2]._id, startDate: now, endDate: new Date(now.getTime() + 48 * 60 * 60 * 1000), leaveType: 'Sick Leave', status: 'Approved', reason: 'Fever' },
            { user: users[1]._id, startDate: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000), endDate: new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000), leaveType: 'Casual Leave', status: 'Pending', reason: 'Family trip' }
        ]);

        // 6. Create Announcements
        await Announcement.create([
            { title: 'Mandatory Safety Protocol Update', message: 'All field engineers must attend the safety briefing tomorrow at 9 AM.', priority: 'Important', audience: 'All Employees', sender: users[3]._id },
            { title: 'New Site Added', message: 'The Ahmedabad plant is now fully operational.', priority: 'Normal', audience: 'All Employees', sender: users[3]._id }
        ]);



        console.log('Database successfully seeded with demo data!');
        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

seedData();
