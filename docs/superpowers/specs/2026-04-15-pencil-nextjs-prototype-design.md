# Pencil Next.js Prototype Design

**Date:** 2026-04-15
**Source of Truth:** `designs/pencil-ui.pen` and the exported logic board at `generated/pencil-pages-labeled/logic-board.png`

## Goal

Create a new `Next.js + Tailwind` prototype site inside this repository that reproduces the finalized Pencil screens as the source of truth, preserves the user's page logic, and provides full page routing plus clickable navigation across the complete product flow.

## Product Boundary

This prototype site is not a replacement for the WeChat mini program runtime. It is a parallel web prototype used to review information architecture, visual hierarchy, and flow continuity against the Pencil design.

The prototype should:

- render every finalized Pencil screen as a route
- preserve the four first-level pages
- preserve the flow structure under `Workflow`
- support mobile-first fidelity and desktop-friendly presentation
- use mock data only

The prototype should not:

- call existing cloud functions
- integrate payment, login, or membership backends
- implement production-grade form submission or AI generation

## Information Architecture

### First-Level Pages

The top-level routes should map directly to the design logic:

- `Home`
- `Workflow`
- `AI Chat Home`
- `My Center`

These should exist as explicit routes in the web app and be accessible from a shared bottom navigation on mobile layouts and a persistent shell on desktop layouts.

### Secondary Flows

The secondary routes should follow the Pencil logic board exactly:

- `Copywriter / Start`
- `Copywriter / Step1 Keywords`
- `Copywriter / Step2 Ideas`
- `Copywriter / Step3 Profile`
- `Copywriter / Step4 Topics`
- `Copywriter / Step5 Articles`
- `Copywriter / Step6 Detail`
- `Title Generate`
- `Title Library`
- `Moments Generate`
- `Moments Editor`
- `Ranking Detail`
- `Reading Detail`

### Route Model

The recommended route structure is:

- `/`
- `/workflow`
- `/assistant`
- `/me`
- `/copywriter/start`
- `/copywriter/keywords`
- `/copywriter/ideas`
- `/copywriter/profile`
- `/copywriter/topics`
- `/copywriter/articles`
- `/copywriter/detail`
- `/title/generate`
- `/title/library`
- `/moments/generate`
- `/moments/editor`
- `/ranking/detail`
- `/reading/detail`

This route model favors clarity over over-abstraction. The route names should stay aligned with the Pencil page meanings rather than internal implementation shortcuts.

## Interaction Model

### Home

`Home` is an entry hub, not a workflow execution page.

Its primary interactions should be:

- ranking card -> `Ranking Detail`
- creation area -> `Workflow`
- reading collection area -> `Reading Detail`

It should not directly branch into multiple workflow tools from the homepage body.

### Workflow

`Workflow` is the main entry hub for creator flows. It should visibly group the three major paths:

- copywriter flow
- title creation flow
- moments copy flow

Each card or CTA should navigate into its route chain.

### Copywriter Flow

The copywriter flow should feel sequential and recoverable. The prototype should expose:

- back navigation
- forward progression
- route-to-route continuity
- simple mock selections that allow users to move through the flow

The prototype does not need durable storage. Local component state per page is enough as long as navigation is testable.

### Assistant and My Center

These are top-level pages in the logic, but they do not drive the main creation workflow. They should be implemented as visually complete, navigable screens with static or lightly mocked content.

## Visual System

### Fidelity Standard

The Pencil file is the only visual truth source. The web prototype should aim for high-fidelity reproduction of:

- spacing rhythm
- typography hierarchy
- card shapes
- gradients and fills
- icon placement
- imagery blocks
- button emphasis

The implementation may translate values into Tailwind tokens and custom CSS variables, but it should not redesign the layout.

### Shared UI Shell

The web app should use a small shared shell to avoid repeating layout code:

- mobile viewport container
- desktop preview stage
- top page header pattern
- bottom tab navigation for first-level pages
- shared card/button/badge primitives

This shell exists to preserve consistency across routes, not to reinterpret the design.

### Responsive Strategy

Mobile is the primary reference layout. Desktop should present the same page composition in a centered stage with enough surrounding space and a controlled background treatment.

Desktop should not introduce a different information architecture. It should simply make the same pages easier to review in a browser.

## Data and State

All page content should be powered by local mock data colocated inside the new web app.

Suggested data layers:

- route-local mock page data for static copy and list items
- small shared navigation metadata for tabs and workflow cards
- minimal transient UI state for selected chips, current step previews, and toggleable cards

No remote data fetching is required for the first version.

## Code Structure

The new web prototype should live under `web/` and remain isolated from the mini program codebase.

Recommended structure:

- `web/app/` for routes
- `web/components/` for shared UI
- `web/lib/` for route metadata and mock content
- `web/public/` for copied design images as needed

This keeps the mini program and web prototype separate while allowing both to coexist in the same repository.

## Testing and Verification

The implementation should include enough verification to catch routing regressions and broken page shells:

- route smoke tests for key first-level and secondary routes
- at least one test for top-level navigation behavior
- successful `next build`

Visual verification should use direct comparison against the exported Pencil screenshots during implementation.

## Risks and Controls

### Risk: Over-abstracting too early

If the site is over-modeled into a design system before the pages exist, delivery will slow down and fidelity will drift.

Control:

- build a small set of primitives only where repetition is obvious
- prioritize page completion and route correctness first

### Risk: Drift from the Pencil logic board

A route may look right visually but still violate the intended flow structure.

Control:

- keep the logic board open during implementation
- encode route mapping explicitly in a shared route manifest

### Risk: Desktop adaptation changing the design

Desktop layouts can accidentally become redesigns.

Control:

- treat desktop as a presentation shell around the mobile-first page
- preserve the original hierarchy and proportions inside the stage

## Success Criteria

This work is complete when:

- every finalized Pencil screen has a corresponding web route
- all routes are reachable through clickable navigation
- first-level pages and secondary flows match the logic board
- mobile presentation is high-fidelity to Pencil
- desktop presentation is clean and reviewable
- the web app builds successfully
