# AGENTS.md — Bahlee Strength Training App

## Project Overview
A personal gym strength training app for Mahlee, built with ASP.NET Razor Pages (server-side rendered).

## Tech Stack
- **Backend/Frontend:** ASP.NET 10 Razor Pages (C#)
- **Testing:** Cypress E2E tests (TypeScript)
- **Runtime:** .NET 10, Node.js 25

## Project Structure
```
prototypes/strength/
├── BahleeStrength/          # ASP.NET Razor Pages project
│   ├── Pages/               # Razor pages (.cshtml + .cshtml.cs)
│   ├── wwwroot/             # Static assets (CSS, JS, images)
│   ├── appsettings.json     # Configuration (including AccessKey)
│   └── Program.cs           # App startup and configuration
├── cypress/
│   ├── e2e/                 # E2E test specs (one per feature)
│   └── support/             # Cypress support files
├── scripts/
│   └── agile-validate.sh    # Validation script (DO NOT EDIT)
├── cypress.config.ts        # Cypress configuration
├── tsconfig.json            # TypeScript config for Cypress
└── package.json             # Node dependencies (Cypress, etc.)
```

## Conventions

### Access Key
- The app uses a URL-based access key stored in `appsettings.json` under `AccessKey`
- The key is validated server-side — no client-side exposure
- Invalid keys redirect to a bland decoy page at `/`

### Testing
- Cypress base URL: `http://localhost:5000`
- The .NET app must be running on port 5000 before Cypress tests execute
- Use `data-testid` attributes for all Cypress element selections
- One `it` block per acceptance criterion, with GWT comments above each

### Code Style
- Follow standard ASP.NET Razor Pages conventions
- Use `data-testid` attributes on all interactive/assertable HTML elements

### Routing Pattern
- The `App.cshtml` page uses `@page "/{key}"` to capture the access key from the URL
- The `OnGet(string key)` method validates the key against `IConfiguration["AccessKey"]`
- Invalid keys return `RedirectToPage("/Index")` — the decoy page
- Valid keys return `Page()` to render the actual app content

### Layout
- `_Layout.cshtml` has been stripped of all app-identifying branding (no "BahleeStrength" text)
- The decoy page at `/` must not contain any revealing words: "Mahlee", "strength", "workout", "gym"
- This is enforced by Cypress tests

### TypeScript / Cypress Quirks
- TypeScript 6+ deprecates `moduleResolution: "node"` and `downlevelIteration` — Cypress's bundled webpack uses these internally
- The `tsconfig.json` must include `"ignoreDeprecations": "6.0"` to suppress these errors
- Cypress 15 shows a warning about `allowCypressEnv` — this is informational and doesn't affect test execution
