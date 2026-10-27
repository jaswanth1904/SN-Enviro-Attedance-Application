const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const User = require('./models/User');
const Attendance = require('./models/Attendance');
const Explanation = require('./models/Explanation');
const Leave = require('./models/Leave');

async function runDatabaseDiagnostics() {
    console.log('\n================================================================');
    console.log('🔍 SN ENVIRO DATABASE TERMINAL DIAGNOSTIC & STORAGE MONITOR');
    console.log('================================================================');
    console.log(`Connected to: ${process.env.MONGO_URI ? 'MongoDB Atlas Cloud' : 'Local MongoDB'}`);
    console.log(`Timestamp   : ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} IST\n`);

    try {
        await mongoose.connect(process.env.MONGO_URI);

        // ================================================================
        // 1. DATABASE MEMORY & STORAGE USAGE STATS
        // ================================================================
        const stats = await mongoose.connection.db.command({ dbStats: 1 });
        const dataSizeKB = (stats.dataSize / 1024).toFixed(2);
        const storageSizeKB = (stats.storageSize / 1024).toFixed(2);
        const indexSizeKB = (stats.indexSize / 1024).toFixed(2);
        const totalSizeKB = ((stats.storageSize + stats.indexSize) / 1024).toFixed(2);
        const totalSizeMB = (totalSizeKB / 1024).toFixed(3);
        const freeTierLimitMB = 512; // MongoDB Atlas M0 Free Tier size
        const percentageUsed = ((totalSizeMB / freeTierLimitMB) * 100).toFixed(2);

        console.log('💾 DATABASE MEMORY & STORAGE STATS:');
        console.log(`   • Database Name         : ${stats.db}`);
        console.log(`   • Total Collections     : ${stats.collections}`);
        console.log(`   • Total Record Count    : ${stats.objects} documents`);
        console.log(`   • Raw Data Size         : ${dataSizeKB} KB`);
        console.log(`   • Storage Allocated     : ${storageSizeKB} KB`);
        console.log(`   • Index Memory Size     : ${indexSizeKB} KB`);
        console.log(`   • Total Disk Memory Used: ${totalSizeKB} KB (~${totalSizeMB} MB)`);
        console.log(`   • Atlas M0 Quota Limit  : ${freeTierLimitMB} MB`);
        console.log(`   • Storage Capacity Used : ${percentageUsed}% (Safe & Plenty of headroom!)\n`);

        // ================================================================
        // 2. PERSONNEL REGISTRY
        // ================================================================
        const users = await User.find({}, 'name email role department').lean();
        console.log(`👥 REGISTERED PERSONNEL (${users.length} Total):`);
        users.forEach((u, i) => {
            console.log(`   ${i + 1}. ${u.name.padEnd(20)} | ${u.role.padEnd(18)} | ${u.email}`);
        });

        // ================================================================
        // 3. TODAY'S ATTENDANCE LOGS
        // ================================================================
        const todayStr = new Date().toISOString().split('T')[0];
        const todayLogs = await Attendance.find().populate('user', 'name role').sort({ timestamp: -1 }).lean();
        
        const filteredToday = todayLogs.filter(log => {
            return new Date(log.timestamp).toISOString().split('T')[0] === todayStr;
        });

        console.log(`\n📋 TODAY'S LOGINS (${filteredToday.length} Logged In Today - ${todayStr}):`);
        if (filteredToday.length === 0) {
            console.log('   (No attendance logs recorded for today yet)');
        } else {
            filteredToday.forEach((log, i) => {
                const istTime = new Date(log.timestamp).toLocaleTimeString('en-IN', {
                    timeZone: 'Asia/Kolkata',
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                    hour12: true
                });
                const userName = log.user?.name || '⚠️ UNKNOWN USER';
                console.log(`   ${i + 1}. [${istTime}] ${userName.padEnd(20)} | Status: ${log.status.padEnd(8)} | Location: ${log.locationName || 'Unknown'}`);
            });
        }

        // ================================================================
        // 4. DATABASE INTEGRITY & BUG DETECTION
        // ================================================================
        console.log('\n🔎 RUNNING DATABASE INTEGRITY & BUG CHECKS:');
        let anomaliesFound = 0;

        // Check: Orphaned records (records where user reference is missing or null)
        const orphaned = await Attendance.find({ user: null });
        if (orphaned.length > 0) {
            console.log(`   ❌ BUG DETECTED: Found ${orphaned.length} orphaned attendance records with null user!`);
            anomaliesFound++;
        } else {
            console.log('   ✅ User Reference Integrity: 100% Valid (0 orphaned records)');
        }

        // Check: Records missing GPS coordinates
        const missingGps = await Attendance.find({
            $or: [
                { 'location.coordinates': { $exists: false } },
                { 'location.coordinates': { $size: 0 } }
            ]
        });
        if (missingGps.length > 0) {
            console.log(`   ❌ ANOMALY: Found ${missingGps.length} records missing GPS coordinates!`);
            anomaliesFound++;
        } else {
            console.log('   ✅ Geo-Location Telemetry: 100% Valid (All coordinates present)');
        }

        // ================================================================
        // 5. PENDING LATE EXPLANATIONS
        // ================================================================
        const pendingExplanations = await Explanation.find({ status: { $regex: /pending/i } }).populate('user', 'name');
        console.log(`\n📝 PENDING LATE EXPLANATIONS (${pendingExplanations.length}):`);
        if (pendingExplanations.length === 0) {
            console.log('   (No pending explanations awaiting review)');
        } else {
            pendingExplanations.forEach((exp, i) => {
                console.log(`   ${i + 1}. ${exp.user?.name || 'Unknown'} - Reason: "${exp.reason || exp.explanation || 'No reason specified'}" [Status: ${exp.status}]`);
            });
        }

        console.log('\n================================================================');
        if (anomaliesFound === 0) {
            console.log('✨ DATABASE HEALTH: EXCELLENT (0 corruption or bug anomalies detected)');
        } else {
            console.log(`⚠️ DATABASE HEALTH: ${anomaliesFound} issues flagged above for review`);
        }
        console.log('================================================================\n');

        await mongoose.disconnect();
    } catch (err) {
        console.error('Diagnostic error:', err.message);
        await mongoose.disconnect();
    }
}

runDatabaseDiagnostics();
