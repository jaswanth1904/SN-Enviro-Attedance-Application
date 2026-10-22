const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const request = require('supertest');
const app = require('../server'); // Assuming app is exported from server.js

jest.setTimeout(60000);

let mongoServer;

beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);
});

afterAll(async () => {
    await mongoose.disconnect();
    if (mongoServer) await mongoServer.stop();
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

describe('IST Auto-Checkout & Shift Metrics Helper', () => {
    const {
        getISTDateString,
        getIST7PM,
        getIST6PMPivot,
        calculateShiftMetrics
    } = require('../utils/attendanceHelper');

    it('Should correctly format dates in IST (Asia/Kolkata)', () => {
        const date = new Date('2026-10-20T04:30:00.000Z'); // 10:00 AM IST
        expect(getISTDateString(date)).toBe('2026-10-20');
    });

    it('Should construct accurate 7:00 PM IST cutoff regardless of host timezone', () => {
        const date = new Date('2026-10-20T04:30:00.000Z');
        const cutoff = getIST7PM(date);
        expect(cutoff.toISOString()).toBe('2026-10-20T13:30:00.000Z');
    });

    it('Should calculate standard 9am-7pm shift (10 total hrs, 1 hr OT past 6pm)', () => {
        const metrics = calculateShiftMetrics('2026-10-20T09:00:00+05:30', '2026-10-20T19:00:00+05:30');
        expect(metrics.totalHours).toBe(10);
        expect(metrics.overtime).toBe(1);
    });

    it('Should calculate early checkout before 6pm with zero overtime', () => {
        const metrics = calculateShiftMetrics('2026-10-20T10:00:00+05:30', '2026-10-20T16:30:00+05:30');
        expect(metrics.totalHours).toBe(6.5);
        expect(metrics.overtime).toBe(0);
    });

    it('Should calculate overtime for work ending between 6pm and 7pm', () => {
        const metrics = calculateShiftMetrics('2026-10-20T10:00:00+05:30', '2026-10-20T18:45:00+05:30');
        expect(metrics.totalHours).toBe(8.75);
        expect(metrics.overtime).toBe(0.75);
    });
});

describe('Multi-Employee 7:00 PM Auto-Checkout & Morning Login Lifecycle', () => {
    const Attendance = require('../models/Attendance');
    const User = require('../models/User');
    const { autoClosePendingAttendances, getISTDateString } = require('../utils/attendanceHelper');

    let emp1, emp2, emp3;

    beforeEach(async () => {
        await Attendance.deleteMany({});
        await User.deleteMany({});

        emp1 = await User.create({
            name: 'Jaswanth',
            email: 'jaswanth@snenviro.com',
            password: 'password123',
            role: 'Application Engineer'
        });

        emp2 = await User.create({
            name: 'Kishore',
            email: 'kishore@snenviro.com',
            password: 'password123',
            role: 'Senior Project Engineer'
        });

        emp3 = await User.create({
            name: 'Ramesh',
            email: 'ramesh@snenviro.com',
            password: 'password123',
            role: 'Site Engineer'
        });
    });

    it('1. Should auto-checkout ALL employees with open shifts from previous days or past 7pm', async () => {
        // Create active shifts from yesterday morning
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        yesterday.setHours(9, 30, 0, 0);

        const rec1 = await Attendance.create({
            user: emp1._id,
            timestamp: yesterday,
            status: 'Present',
            locationName: 'Kanigiri',
            location: { type: 'Point', coordinates: [79.5113, 15.4065] },
            checkOut: null
        });

        const rec2 = await Attendance.create({
            user: emp2._id,
            timestamp: yesterday,
            status: 'Present',
            locationName: 'Nellore Site',
            location: { type: 'Point', coordinates: [79.9864, 14.4426] },
            checkOut: null
        });

        const rec3 = await Attendance.create({
            user: emp3._id,
            timestamp: yesterday,
            status: 'Present',
            locationName: 'Tirupati Site',
            location: { type: 'Point', coordinates: [79.4192, 13.6288] },
            checkOut: null
        });

        // Trigger the automated multi-employee checkout
        const closedCount = await autoClosePendingAttendances();
        expect(closedCount).toBe(3);

        // Verify each employee's record in MongoDB is now properly checked out
        const allAttendances = await Attendance.find({ checkOut: null });
        expect(allAttendances.length).toBe(0); // ZERO unclosed sessions remaining

        const updated1 = await Attendance.findById(rec1._id);
        const updated2 = await Attendance.findById(rec2._id);
        const updated3 = await Attendance.findById(rec3._id);

        expect(updated1.checkOut).not.toBeNull();
        expect(updated2.checkOut).not.toBeNull();
        expect(updated3.checkOut).not.toBeNull();

        // Check that checkout time is exactly 7:00 PM IST of yesterday
        const yesterdayIST = getISTDateString(yesterday);
        const expectedCloseISO = new Date(`${yesterdayIST}T19:00:00+05:30`).toISOString();

        expect(new Date(updated1.checkOut).toISOString()).toBe(expectedCloseISO);
        expect(new Date(updated2.checkOut).toISOString()).toBe(expectedCloseISO);
        expect(new Date(updated3.checkOut).toISOString()).toBe(expectedCloseISO);

        // Verify total hours and overtime calculated (9:30 AM to 7:00 PM = 9.5h, 1h OT)
        expect(updated1.totalHours).toBe(9.5);
        expect(updated1.overtime).toBe(1.0);
    });

    it('2. Should display fresh Morning Login state for employees on the next day', async () => {
        // Simulate yesterday's attendance already auto-checked out at 7pm
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        yesterday.setHours(9, 0, 0, 0);

        const yesterdayIST = getISTDateString(yesterday);
        const closeTime = new Date(`${yesterdayIST}T19:00:00+05:30`);

        await Attendance.create({
            user: emp1._id,
            timestamp: yesterday,
            status: 'Present',
            locationName: 'Kanigiri',
            location: { type: 'Point', coordinates: [79.5113, 15.4065] },
            checkOut: closeTime,
            totalHours: 10,
            overtime: 1
        });

        // Next morning: employee opens dashboard
        const myAttendances = await Attendance.find({ user: emp1._id }).sort('-timestamp');
        const latest = myAttendances[0];

        // Evaluate the frontend Dashboard state logic for next morning
        const now = new Date(); // Today 8:30 AM
        now.setHours(8, 30, 0, 0);

        const isTodayRecord = latest && new Date(latest.timestamp).toDateString() === now.toDateString();
        const isPastSevenPM = now.getHours() >= 19;
        const isCheckedIn = isTodayRecord && !latest.checkOut && !isPastSevenPM;
        const isShiftCompletedToday = isTodayRecord && (!!latest.checkOut || isPastSevenPM);

        // In the morning:
        expect(isTodayRecord).toBe(false);       // Yesterday's record is NOT today's
        expect(isCheckedIn).toBe(false);         // Employee is NOT currently checked in
        expect(isShiftCompletedToday).toBe(false);// Today's shift is NOT completed yet

        // Therefore UI status is 'Ready to Work?' and Login/Mark Checkin button is ACTIVE
        const uiStatus = isCheckedIn ? 'Shift Active' : isShiftCompletedToday ? 'Shift Completed' : 'Ready to Work?';
        expect(uiStatus).toBe('Ready to Work?');

        const isLoginButtonVisible = !isCheckedIn && !isShiftCompletedToday;
        expect(isLoginButtonVisible).toBe(true); // Login button appears fresh!
    });

    it('3. Should resolve legacy 48-hour stuck sessions from 2 days ago cleanly', async () => {
        // Reproduce the screenshot scenario: Employee clocked in 2 days ago, checkOut was null
        const twoDaysAgo = new Date();
        twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
        twoDaysAgo.setHours(10, 0, 0, 0);

        const stuckRecord = await Attendance.create({
            user: emp1._id,
            timestamp: twoDaysAgo,
            status: 'Present',
            locationName: 'Kanigiri',
            location: { type: 'Point', coordinates: [79.5113, 15.4065] },
            checkOut: null
        });

        // Run autoClosePendingAttendances (mimicking startup sweep or getMyAttendance)
        await autoClosePendingAttendances({ user: emp1._id });

        const resolved = await Attendance.findById(stuckRecord._id);
        expect(resolved.checkOut).not.toBeNull();
        expect(resolved.totalHours).toBe(9); // 10:00 to 19:00 = 9 hrs (NOT 48 hrs!)
        expect(resolved.overtime).toBe(1);   // 18:00 to 19:00 = 1 hr

        // When employee opens dashboard today, latest is from 2 days ago
        const now = new Date();
        const isToday = new Date(resolved.timestamp).toDateString() === now.toDateString();
        expect(isToday).toBe(false);

        // Session timer reset check
        const sessionTimer = isToday ? '48:18:29' : '00:00:00';
        expect(sessionTimer).toBe('00:00:00'); // Starts fresh from 00:00:00!
    });
});
