describe('TV Live Map Automation Test', () => {
  beforeEach(() => {
    // Intercept the API call to mock the response and ensure stability
    cy.intercept('GET', '/api/attendance/tv-reports', {
      statusCode: 200,
      body: []
    }).as('getReports');
    
    // Intercept socket.io connections to prevent timeout warnings in cypress
    cy.intercept('GET', '/socket.io/*', {
      statusCode: 200,
      body: ''
    });

    cy.visit('http://localhost:5173/tv-map');
  });

  it('should successfully render the Global Command Center map without crashing', () => {
    // 1. Verify the Cinematic Header rendered correctly
    cy.contains('SN Enviro', { timeout: 10000 }).should('be.visible');
    cy.contains('Global Command Center').should('be.visible');

    // 2. Verify the Map Container rendered successfully
    cy.get('.leaflet-container', { timeout: 10000 }).should('be.visible');

    // 3. Verify the Dark/Light Mode toggle exists and works
    cy.get('button').find('svg').should('exist');
    
    // The map is currently in Light mode by default (bg-[#f8fafc])
    cy.get('div').should('have.class', 'bg-[#f8fafc]');

    // Click the toggle to switch to Dark Mode
    cy.get('button').first().click();

    // Verify it switched to Dark mode (bg-[#0a0a0a])
    cy.get('div').should('have.class', 'bg-[#0a0a0a]');
  });
});
