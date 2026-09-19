const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const request = require('supertest');
const app = require('../server'); // Assuming app is exported from server.js

let mongoServer;

beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);
});

afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
});

describe('Attendance API Security & Validation', () => {
    it('Should reject attendance without a valid token', async () => {
        const res = await request(app).post('/api/attendance').send({
            latitude: 17.3850,
            longitude: 78.4867,
            locationName: 'Hyderabad',
            timestamp: new Date().toISOString()
        });
        
        expect(res.statusCode).toEqual(401);
        expect(res.body.success).toBe(false);
        expect(res.body.error).toMatch(/Not authorized/i);
    });
});
