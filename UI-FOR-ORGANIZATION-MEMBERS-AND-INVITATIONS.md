## UI for Organization Members & Invitations — Implementation Plan

> Progress will be tracked by checking off the `[ ]` boxes during implementation.

### Guiding Principles
- [ ] Favor existing shadcn/ui primitives (Form, Input, Select, Button, Card, Table, Skeleton, Dialog, Badge, Alert) for consistent styling.
- [ ] Refer to shadcn/ui documentation when additional primitives are needed and bring them in via the CLI.
- [ ] Keep business logic inside Better Auth plugin helpers; UI components remain presentational.
- [ ] Maintain i18n coverage (en/fr) for every new string.
- [ ] Ensure accessibility and responsive behavior across breakpoints.
- [ ] Standardize new forms on TanStack Form (per shadcn docs) instead of `react-hook-form`.
- [ ] Always expose explicit `id` or analytics-friendly `data-*` attributes on actionable elements (buttons, links, toggles) using established project patterns.
- [ ] Do **not** install or rely on React Testing Library at any point.

### Prerequisites
- [ ] Confirm Better Auth organization helpers (`inviteMember`, `listInvitations`, `cancelInvitation`, `getInvitation`, `listUserInvitations`, `acceptInvitation`, `rejectInvitation`) provide adequate loading/error signaling for UI integration.
- [ ] Identify target directories (e.g. `apps/web/src/routes/_authenticated/settings/organizations.tsx`, `apps/web/src/components/organizations`, `apps/web/src/i18n`) for component placement and locale updates.
- [ ] Audit existing shadcn components (Form, Input, Select, Button, Card, Table, ScrollArea, Skeleton, Dialog, Alert, Badge). Generate missing primitives. Use tanstack form version documented here : https://ui.shadcn.com/docs/forms/tanstack-form
- [ ] Review Better Auth organization plugin documentation to confirm expected flows and payloads: https://www.better-auth.com/docs/plugins/organization

---

### Phase 1 — Inviter UI: Invite Members Form
**Goal:** allow org owners/admins to invite members from the active organization card.

**Deliverables**
- [ ] Create `InviteMemberForm.tsx` using shadcn `Form` + `FormField`, `Input` (email), `Select` (role), and `Button` (submit). Build the form with TanStack Form + zod adapter for validation.
- [ ] Render `InviteMemberForm` inside the active organization card (e.g. `apps/web/src/routes/_authenticated/settings/organizations.tsx`) when `authClient.organization.canManageMembers` is true.
- [ ] Add translation keys: labels, placeholders, helper text, validation errors, success/error toasts (en/fr).
- [ ] Attach stable identifiers (`id`) to form controls and submit button for analytics/QA.

**UX & Behavior**
- [ ] Disable submit while the invitation request is pending; show loading spinner in the button.
- [ ] Surface API failures with shadcn `Alert` or inline `FormMessage`.
- [ ] On success, trigger invitations list refresh (Phase 2) via `router.invalidate()` or a shared state event.
- [ ] Display optional helper text if the server returns limits or guidance.

### Phase 2 — Inviter UI: Pending Invitations List
**Goal:** surface outstanding invitations with cancellation controls.

**Deliverables**
- [ ] Build `PendingInvitationsList.tsx` as a shadcn `Card` containing a `Table` with columns: Email, Role (Badge), Expires (countdown), Actions.
- [ ] Fetch data via `authClient.organization.listInvitations(activeOrgId)` inside a TanStack Router loader or dedicated server function; render `Skeleton` rows while loading and `Alert` for empty/error states.
- [ ] Implement cancel action button that opens a shadcn `Dialog` confirmation before calling `cancelInvitation`.
- [ ] Integrate the list beneath `InviteMemberForm` behind the same permission guard.
- [ ] Localize headings, countdown strings, dialog text, empty state copy.
- [ ] Provide stable identifiers for table actions (e.g., cancel buttons and dialog confirm buttons).

**UX & Behavior**
- [ ] Mark expired invitations with `Badge variant="destructive"` and disable cancellation.
- [ ] Use a countdown helper (`Expires in 2d 4h`) refreshing at one-minute intervals.
- [ ] Apply optimistic updates: remove canceled invitation immediately with rollback on failure.
- [ ] Notify users of success/failure through existing toast system.

### Phase 3 — Invitee UI: Accept/Reject Route
**Goal:** standalone route enabling invitees to accept or reject invitations.

- [ ] Implement public-facing route file `apps/web/src/routes/accept-invitation/$invitationId.tsx` rendering an `InvitationCard` built with shadcn `Card`.
- [ ] Fetch invitation summary via server loader (`authClient.organization.getInvitation(invitationId)`) and surface org name, inviter, role, expiration, and status messaging.
- [ ] When a user is authenticated, show inline accept/reject buttons (`Button` components) with loading states, stable identifiers, and post-action redirects.
- [ ] When unauthenticated, present a friendly explanation of the invitation and a primary CTA to log in or create an account; preserve the invitation URL via `redirect` search params for post-login return.
- [ ] Handle expired/invalid invitations with shadcn `Alert` and navigation back to dashboard.
- [ ] Localize all strings for en/fr.

**UX & Behavior**
- [ ] Detect auth state (via root context) to toggle between full action controls and unauthenticated guidance; post-login, re-run the loader to enable actions automatically.
- [ ] Include a global error fallback using `Alert`.

### Phase 4 — Invitee UI: User Invitations Dashboard
**Goal:** show pending invitations for authenticated users in settings.

**Deliverables**
- [ ] Create `UserInvitationsCard.tsx` (shadcn `Card`) listing invitations with org name, inviter, role badge, expiration countdown, and inline accept/reject buttons.
- [ ] Implement `useUserInvitations()` backed by a TanStack Router loader or shared server function calling `authClient.organization.listUserInvitations()`, with manual refresh or polling as needed.
- [ ] Reuse accept/reject handlers from Phase 3 via a shared hook (`useHandleInvitationAction`).
- [ ] Insert the card at the top of the organizations settings page; hide visually when list is empty but keep mounted for refresh triggers.
- [ ] Add translation entries for headings, empty states, button labels.
- [ ] Assign `id` attributes to list items and action buttons.

**UX & Behavior**
- [ ] Provide loading skeleton states while fetching.
- [ ] After accept/reject, invalidate user invitations and organizations membership queries to sync UI.
- [ ] Use optimistic removal with toast feedback for success/error.

---

### Phase 5 — Manual Validation Script
**Goal:** provide a repeatable test script to validate the end-to-end invitation experience.

**Test Script**
- [ ] Sign in as an organization owner/admin and open the organizations settings view; confirm `InviteMemberForm` renders with the expected `id`/`data-*` attributes, trigger validation by submitting an invalid email and missing role, then send a valid invite and note success feedback plus the placeholder console email log in dev.
- [ ] Verify the Pending Invitations list now shows the invite with role badge, expiration countdown, and stable identifiers; exercise the cancel flow, including confirmation dialog, optimistic removal, and simulated failure (e.g., block the network request) to ensure rollback messaging.
- [ ] Open the invite link in a logged-out/incognito session to confirm the public invitation page renders summary details plus a login CTA; follow the login flow, ensure the invitation reloads with accept/reject actions, then accept the invite and confirm success feedback and redirect to organizations settings.
- [ ] Create another invite and, while authenticated, visit the accept route again; choose reject, confirm the dialog copy, and ensure the user lands on the expected page with explanatory messaging.
- [ ] As an invitee with multiple pending invites, review the User Invitations card for correct listing, countdowns, and identifiers; perform inline accept/reject actions to confirm optimistic updates and subsequent refresh of the organizations list.
- [ ] Observe the header notification badge as invites are created, accepted, or canceled to ensure counts update in real time and drop to zero when cleared.
- [ ] Log in as a non-admin member to confirm the invite form and pending list are hidden while personal invitations still appear when applicable.
- [ ] Scan interactive controls across all new surfaces to ensure required `id` attributes are present and no analytics events were introduced beyond identifiers.
- [ ] Finalize documentation/release notes and verify that no React Testing Library dependency was added.

