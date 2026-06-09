# Staff Availability Scheduler

A fullstack application for managing staff availability and calculating open appointment slots.

## Tech Stack

- **Next.js 15** — fullstack framework (frontend + server actions)
- **Prisma 7 + SQLite** — database ORM and local persistence
- **TypeScript** — type safety across the full stack
- **Tailwind CSS** — utility-first styling
- **date-fns** — date manipulation utilities

## Setup Instructions

### Prerequisites
- Node.js v18.17 or later

### Steps

1. Clone the repository
```bash
   git clone <your-repo-url>
   cd vironix-case-study
```

2. Install dependencies
```bash
   npm install
```

3. Generate the Prisma client
```bash
   npx prisma generate
```

4. Run database migrations
```bash
   npx prisma migrate dev --name init
```

5. Start the development server
```bash
   npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000)

## Data Model

### StaffMember
Stores staff member names.

### RecurringAvailability
Represents a staff member's recurring weekly schedule. One record per day of week per staff member. Each record has one or more `TimeWindow` records defining the available hours.

### AvailabilityOverride
Represents a one-off exception for a specific calendar date. Supports three types:
- `unavailable` — staff member is off all day
- `replace` — ignore recurring schedule, use override windows instead
- `add` — keep recurring schedule and add extra windows on top

### TimeWindow
A start/end time block (stored as `HH:MM`) belonging to either a `RecurringAvailability` or an `AvailabilityOverride`.

## Scheduling Logic

The core scheduling logic lives in `lib/scheduling.ts` as a pure function with no database or framework dependencies.

### How it works

Given a staff member, date range, and appointment duration:

1. Build a map of overrides keyed by date (`YYYY-MM-DD`)
2. Build a map of recurring availability keyed by day of week
3. Iterate through each date in the range
4. For each date, determine the source of availability:
   - If an override exists for that date:
     - `unavailable` → no slots
     - `replace` → generate slots from override windows only
     - `add` → generate slots from recurring windows + override windows combined
   - If no override, use recurring availability for that day of week
   - If neither, mark as no availability
5. Generate slots by iterating through each time window in increments of the appointment duration

### Slot generation example

If a staff member is available 9:00 AM to 10:00 AM with a 30 minute duration:
- 9:00 AM ✅ (9:00 + 30 = 9:30, fits before 10:00)
- 9:30 AM ✅ (9:30 + 30 = 10:00, fits exactly)
- 10:00 AM ❌ (10:00 + 30 = 10:30, exceeds end time)

## Assumptions

- No authentication — assumes a single admin user
- One override per staff member per date (creating a new override for the same date replaces the existing one)
- Time windows are stored in 24-hour format (`HH:MM`) and displayed in 12-hour format in the UI
- Days of the week follow JavaScript's `Date.getDay()` convention (0 = Sunday, 6 = Saturday)
- Appointment slots are generated on the hour/half-hour based on the start of the availability window, not a fixed clock grid

## Tradeoffs

- **No tests** — given the 2 hour time constraint, tests were omitted. The scheduling logic is isolated in `lib/scheduling.ts` specifically to make it easy to add tests later.
- **No calendar UI** — slots are displayed as a list rather than a calendar grid. A calendar view would improve usability but was deprioritized per the spec.
- **Single page per staff member** — all configuration (recurring, overrides, slot viewer) lives on one page for simplicity rather than separate routes.
- **Prisma 7** — encountered breaking changes with Prisma 7's new engine configuration. Switched from `prisma-client` to `prisma-client-js` provider to avoid requiring a database adapter.

## AI Usage

### Tools used
- Claude (Anthropic) — used throughout the project for scaffolding, debugging, and architecture decisions

### What AI was used for
- Initial project scaffolding and file structure
- Prisma schema design and debugging Prisma 7 breaking changes
- Server action boilerplate
- Component structure and Tailwind styling
- Debugging Next.js 15 `params` Promise change

### What I changed or rejected
- Switched from `cuid()` to `autoincrement()` for simpler, more readable IDs
- Removed `datasources` from `PrismaClient` constructor after identifying it as invalid in Prisma 7
- Reorganized `TimeWindow` model order in schema to fix Prisma relation resolution error

### Bugs and edge cases I identified myself
- Overlapping window validation needed to be added on the client side before the server action was called
- Prisma `create` was receiving full window objects with `id` and foreign key fields — fixed by mapping to `{ startTime, endTime }` only
- Next.js 15 `params` is now a Promise and required updating the type and awaiting before access

### What I am least confident in
- Prisma 7 configuration — encountered several breaking changes and the final setup may not follow the recommended Prisma 7 patterns perfectly
- The `add` override slot deduplication using `Set` may not handle edge cases where recurring and override windows produce identical slot times