/**
 * User Story:
 * As Mahlee, I want a button on each workout day to add it to Google Calendar,
 * so that I can open a prefilled weekly recurring calendar reminder for that workout.
 */

const ACCESS_KEY = "mahlee-strong";
const WORKOUTS_KEY = "bahlee_workouts";

type Workout = {
  id: string;
  name: string;
  day: number;
  plannedTime?: string;
  exercises: string[];
  googleCalendarLinked?: boolean;
};

function visitAppWithWorkouts(workouts: Workout[]) {
  cy.visit(`/${ACCESS_KEY}`, {
    onBeforeLoad(win) {
      win.localStorage.setItem(WORKOUTS_KEY, JSON.stringify(workouts));
    },
  });
}

describe("Google Calendar Workout Reminders", () => {
  // GIVEN Mahlee is creating a workout day
  // WHEN she tries to save it without a planned time
  // THEN the workout is not saved and she is told that a planned time is required
  it("requires a planned time before a workout can be saved", () => {
    visitAppWithWorkouts([]);

    cy.get('[data-testid="add-workout-card"]').click();
    cy.get('[data-testid="workout-name-input"]').type("Pull Day");
    cy.get('[data-testid="workout-day-select"]').select("Thursday");
    cy.get('[data-testid="save-workout-btn"]').click();

    cy.get('[data-testid="planned-time-error"]').should(
      "contain.text",
      "Planned time is required"
    );
    cy.contains('[data-testid="workout-card"]', "Pull Day").should("not.exist");
  });

  // GIVEN Mahlee is viewing a workout day with a name, weekday, and planned time
  // WHEN she clicks the Google Calendar button for that workout
  // THEN the app opens a prefilled Google Calendar event link with a weekly recurrence, a 15-minute reminder, and her local timezone
  it("opens a prefilled Google Calendar link with the workout's recurring schedule details", () => {
    visitAppWithWorkouts([
      {
        id: "pull-day",
        name: "Pull Day",
        day: 4,
        plannedTime: "07:00",
        exercises: ["Machine Row"],
      },
    ]);

    cy.window().then((win) => {
      cy.stub(win, "open").as("windowOpen");
    });

    cy.contains('[data-testid="workout-card"]', "Pull Day")
      .find('[data-testid="add-google-calendar-btn"]')
      .click();

    cy.get("@windowOpen").should("have.been.calledOnce");
    cy.get("@windowOpen").then((stub) => {
      const url = stub.getCall(0).args[0] as string;

      expect(url).to.include("https://calendar.google.com/calendar/render");
      expect(url).to.include("action=TEMPLATE");
      expect(url).to.include("text=Pull%20Day");
      expect(url).to.include("recur=RRULE%3AFREQ%3DWEEKLY%3BBYDAY%3DTH");
      expect(url).to.include("details=Workout%20reminder");
      expect(url).to.include("trp=true");
      expect(decodeURIComponent(url)).to.match(/ctz=[^&]+/);
    });
  });

  // GIVEN Mahlee clicks the Google Calendar button for a workout day
  // WHEN the app opens the Google Calendar link
  // THEN the workout shows that Mahlee has already launched the calendar reminder flow for that workout
  it("marks the workout as calendar-linked after opening the Google Calendar link", () => {
    visitAppWithWorkouts([
      {
        id: "legs",
        name: "Leg Day",
        day: 3,
        plannedTime: "18:30",
        exercises: ["Bulgarian Split Squat"],
      },
    ]);

    cy.window().then((win) => {
      cy.stub(win, "open").as("windowOpen");
    });

    cy.contains('[data-testid="workout-card"]', "Leg Day")
      .find('[data-testid="add-google-calendar-btn"]')
      .click();

    cy.get("@windowOpen").should("have.been.calledOnce");

    cy.contains('[data-testid="workout-card"]', "Leg Day")
      .find('[data-testid="google-calendar-status"]')
      .should("contain.text", "Google Calendar opened");

    cy.window().then((win) => {
      const workouts = JSON.parse(
        win.localStorage.getItem(WORKOUTS_KEY) ?? "[]"
      ) as Workout[];

      expect(workouts[0].googleCalendarLinked).to.equal(true);
    });
  });

  // GIVEN a workout day has already launched the Google Calendar add flow before
  // WHEN Mahlee views that workout day
  // THEN the app indicates that a Google Calendar reminder link has already been opened and does not offer a duplicate add action
  it("shows an existing reminder state for workouts that were already marked as linked", () => {
    visitAppWithWorkouts([
      {
        id: "upper-body",
        name: "Upper Body",
        day: 1,
        plannedTime: "06:15",
        exercises: ["Inclined Dumbbell Press"],
        googleCalendarLinked: true,
      },
    ]);

    cy.contains('[data-testid="workout-card"]', "Upper Body")
      .find('[data-testid="google-calendar-status"]')
      .should("contain.text", "Google Calendar opened");

    cy.contains('[data-testid="workout-card"]', "Upper Body")
      .find('[data-testid="add-google-calendar-btn"]')
      .should("not.exist");
  });

  // GIVEN Mahlee clicks the Google Calendar button for a workout day
  // WHEN the browser blocks the Google Calendar popup
  // THEN the workout remains unchanged and the app indicates the calendar reminder was not opened
  it("shows an error and leaves the workout unlinked when the calendar popup is blocked", () => {
    visitAppWithWorkouts([
      {
        id: "push-day",
        name: "Push Day",
        day: 5,
        plannedTime: "07:45",
        exercises: ["Inclined Dumbbell Press"],
      },
    ]);

    cy.window().then((win) => {
      cy.stub(win, "open").returns(null).as("windowOpen");
    });

    cy.contains('[data-testid="workout-card"]', "Push Day")
      .find('[data-testid="add-google-calendar-btn"]')
      .click();

    cy.get("@windowOpen").should("have.been.calledOnce");

    cy.contains('[data-testid="workout-card"]', "Push Day")
      .find('[data-testid="google-calendar-error"]')
      .should("contain.text", "Google Calendar could not be opened");

    cy.window().then((win) => {
      const workouts = JSON.parse(
        win.localStorage.getItem(WORKOUTS_KEY) ?? "[]"
      ) as Workout[];

      expect(workouts[0].googleCalendarLinked).to.not.equal(true);
    });
  });

  // GIVEN a workout day does not have a planned time yet
  // WHEN Mahlee views that workout day
  // THEN the Google Calendar action is unavailable because the reminder cannot be scheduled
  it("prevents Google Calendar linking for workouts without a planned time", () => {
    visitAppWithWorkouts([
      {
        id: "stretch",
        name: "Stretching",
        day: 2,
        exercises: [],
      },
    ]);

    cy.contains('[data-testid="workout-card"]', "Stretching")
      .find('[data-testid="add-google-calendar-btn"]')
      .should("not.exist");

    cy.contains('[data-testid="workout-card"]', "Stretching")
      .find('[data-testid="google-calendar-status"]')
      .should("contain.text", "Set a planned time to add a calendar reminder");
  });
});
