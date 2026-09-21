const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const uri = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/sn-enviro';
    const conn = await mongoose.connect(uri, {
      tlsAllowInvalidCertificates: true,
      maxPoolSize: 300, // Handle up to 300 concurrent database connections for peak load (500+ users)
      minPoolSize: 20,  // Keep 20 connections ready for instant response
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      family: 4 // Use IPv4 for stability with Atlas
    });
    console.log(`\x1b[32m%s\x1b[0m`, `✔ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`\x1b[31m%s\x1b[0m`, `✖ MongoDB Connection Error: ${error.message}`);

    if (error.message.includes('SSL alert number 80') || error.message.includes('tlsv1 alert internal error')) {
      console.log(`\x1b[33m%s\x1b[0m`, `🚨 SECURITY ALERT: MongoDB Atlas is rejecting your IP address.`);
      console.log(`\x1b[33m%s\x1b[0m`, `---------------------------------------------------------`);
      console.log(`\x1b[33m%s\x1b[0m`, `TO FIX THIS ERROR:`);
      console.log(`\x1b[33m%s\x1b[0m`, `1. Log in to https://cloud.mongodb.com`);
      console.log(`\x1b[33m%s\x1b[0m`, `2. Go to "Network Access" (left sidebar).`);
      console.log(`\x1b[33m%s\x1b[0m`, `3. Click "+ Add IP Address".`);
      console.log(`\x1b[33m%s\x1b[0m`, `4. Click "ALLOW ACCESS FROM ANYWHERE" (0.0.0.0/0) or "ADD CURRENT IP ADDRESS".`);
      console.log(`\x1b[33m%s\x1b[0m`, `5. Click "Confirm" and wait 1 minute for it to activate.`);
      console.log(`\x1b[33m%s\x1b[0m`, `---------------------------------------------------------`);
    } else if (error.message.includes('Could not connect to any servers')) {
      console.log(`\x1b[33m%s\x1b[0m`, `💡 TIP: This is likely a MongoDB Atlas IP Whitelist issue.`);
      console.log(`\x1b[33m%s\x1b[0m`, `1. Go to MongoDB Atlas -> Network Access.`);
      console.log(`\x1b[33m%s\x1b[0m`, `2. Add IP Address "0.0.0.0/0" to allow access from anywhere (for testing).`);
    }

    process.exit(1);
  }
};

module.exports = connectDB;
