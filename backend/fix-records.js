const mongoose=require('mongoose'); 
const { reverseGeocode } = require('./utils/geo'); 
require('dotenv').config(); 
mongoose.connect(process.env.MONGO_URI).then(async () => { 
    const Attendance = mongoose.model('Attendance', new mongoose.Schema({locationName:String, location:{coordinates:[Number]}}, {strict: false})); 
    const records = await Attendance.find({locationName: { $regex: '^Remote Location|Location' }}); 
    for(let record of records) { 
        const newName = await reverseGeocode(record.location.coordinates[1], record.location.coordinates[0]); 
        record.locationName = newName; 
        await record.save(); 
    } 
    console.log('Updated ' + records.length + ' records'); 
    process.exit(0); 
}).catch(console.error);
