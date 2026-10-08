import { PactV3, MatchersV3 } from '@pact-foundation/pact';
import path from 'path';
import { describe, it, expect } from 'vitest';

// 1. Initialize the Contract (The "Agreement" between Frontend and Backend)
const provider = new PactV3({
  consumer: 'AttendanceFrontend-React',
  provider: 'AttendanceBackend-Node',
  dir: path.resolve(process.cwd(), 'tests', 'pacts'), // Where the contract JSON will be saved
});

describe('Attendance API Contract', () => {
  it('expects the backend to return a strict list of attendance records', () => {
    
    // 2. Define the exact shape of the data the frontend expects
    provider
      .given('a user has marked attendance')
      .uponReceiving('a request for my attendance')
      .withRequest({
        method: 'GET',
        path: '/api/attendance/my',
        headers: { Authorization: MatchersV3.string('Bearer sample-token') } 
      })
      .willRespondWith({
        status: 200,
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
        body: {
          success: true,
          count: MatchersV3.integer(1),
          data: MatchersV3.eachLike({
            status: MatchersV3.string('Present'),
            locationName: MatchersV3.string('Hyderabad Plant'),
            timestamp: MatchersV3.string('2023-10-01T10:00:00.000Z'), 
          })
        }
      });

    // 3. Execute the mock test
    return provider.executeTest(async (mockServer) => {
      // Actually make the request to the Pact mock server
      const response = await fetch(`${mockServer.url}/api/attendance/my`, {
        headers: {
          Authorization: 'Bearer sample-token'
        }
      });
      
      const data = await response.json();
      
      // Verify the response is successful
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data[0].locationName).toBe('Hyderabad Plant');
      
      console.log('✅ Frontend successfully consumed the contract from mock server!');
    });
  });
});
