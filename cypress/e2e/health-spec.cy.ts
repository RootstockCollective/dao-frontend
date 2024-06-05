describe('Health spec', () => {
  it('Visits /health', () => {
    cy.visit('/health')
  })

  it('Visits /health and makes sure "Page is OK" exists', () => {
    cy.visit('/health')
    
    cy.contains('body', 'Page is OK').should('be.visible')
  })
})