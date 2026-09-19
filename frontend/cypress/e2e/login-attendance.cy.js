describe('Employee Login and Attendance Flow', () => {
  it('Should successfully login and mark attendance', () => {
    // 1. Visit the login page
    cy.visit('http://localhost:5173/');

    // 2. Click the Login button to open the AuthModal
    cy.contains('Login / Sign Up').click();

    // 3. Fill in the login credentials
    cy.get('input[type="email"]').type('jaswanth@snenvio.in');
    cy.get('input[type="password"]').type('password123');

    // 4. Submit the login form
    cy.get('button[type="submit"]').contains('Sign In').click();

    // 5. Verify redirection to the GPS Attendance page
    cy.url({ timeout: 10000 }).should('include', '/mark-attendance');

    // 6. Mock the Geolocation API so the browser doesn't prompt for permissions
    cy.window().then((win) => {
      cy.stub(win.navigator.geolocation, 'getCurrentPosition').callsFake((callback) => {
        return callback({ coords: { latitude: 17.3850, longitude: 78.4867 } });
      });
    });

    // 7. Click Initiate Login to get GPS Lock
    cy.contains('Initiate Login').click();

    // 8. Wait for the map to load and city name to appear (mocked via intercept or network)
    cy.contains('Confirm & Mark Attendance', { timeout: 15000 }).should('be.visible');

    // 9. Click Confirm
    cy.contains('Confirm & Mark Attendance').click();

    // 10. Verify Site Form appears
    cy.contains('Site Visit Log', { timeout: 10000 }).should('be.visible');
    
    // 11. Submit Site form
    cy.get('textarea').type('Automated Cypress Test Check');
    cy.contains('Submit Attendance').click();

    // 12. Verify Success Popup and redirection to Dashboard
    cy.contains('Attendance Locked!', { timeout: 10000 }).should('be.visible');
    cy.url({ timeout: 15000 }).should('include', '/dashboard');
  });
});
