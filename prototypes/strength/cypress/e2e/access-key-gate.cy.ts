/**
 * User Story:
 * As Mahlee, I want to access my strength training app by navigating to a secret URL,
 * so that only I can see the app and no one else knows it exists.
 */

const ACCESS_KEY = "mahlee-strong";

describe("Access Key Gate", () => {
  // GIVEN Mahlee knows the access key
  // WHEN she navigates to /{valid-access-key}
  // THEN she sees the message "You can do it, Mahlee!"
  it("shows the motivational message when the correct access key is used", () => {
    cy.visit(`/${ACCESS_KEY}`);
    cy.get('[data-testid="motivational-message"]').should(
      "contain.text",
      "You can do it, Mahlee!"
    );
  });

  // GIVEN a visitor does not know the access key
  // WHEN they navigate to the root URL /
  // THEN they see an unassuming page that gives no indication a hidden app exists
  it("shows an unassuming decoy page at the root URL", () => {
    cy.visit("/");
    cy.get('[data-testid="decoy-heading"]').should("contain.text", "Welcome");
    cy.get('[data-testid="decoy-message"]').should(
      "contain.text",
      "Thanks for visiting."
    );
    cy.contains("Mahlee").should("not.exist");
    cy.contains("strength").should("not.exist");
    cy.contains("workout").should("not.exist");
    cy.contains("gym").should("not.exist");
  });

  // GIVEN a visitor uses an invalid access key
  // WHEN they navigate to /{wrong-key}
  // THEN they are redirected to the same unassuming page at /
  it("redirects to the decoy page when an invalid access key is used", () => {
    cy.visit("/wrong-key-123");
    cy.url().should("eq", Cypress.config().baseUrl + "/");
    cy.get('[data-testid="decoy-heading"]').should("contain.text", "Welcome");
    cy.get('[data-testid="decoy-message"]').should(
      "contain.text",
      "Thanks for visiting."
    );
    cy.contains("Mahlee").should("not.exist");
  });
});
