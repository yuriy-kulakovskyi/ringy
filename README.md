**API Flow — ringy**

This document describes the main API flows, middleware, and background processes.

**Authentication Flow**
- **Endpoint**: middleware used across protected routes via `authMiddleware`.
- **Token header**: expects `Authorization: Bearer <token>`.
- **Verification**: middleware calls `AlternativeAuthClient.verify(token)` which POSTs to `VERIFY_TOKEN_URL` with `ALTERNATIVE_AUTH_API_KEY`.
- **On success**: `req.user` is populated with `IUser` (`user_id`, `email`, etc.).
- **On failure**: middleware throws `AppError` (401/400) and request is rejected.

**Error Handling**
- **Global filter**: `allExceptionsFilter` converts `AppError` to structured `HttpErrorResponse` and returns appropriate status.
- **Logging**: non-AppError errors are logged to console; pino is used for normal logs.

**Common Middleware**
- **Input validation**: `validateInput(schema)` uses Zod DTOs (e.g., `CreateCalendarDto`, `UpdateAccountDto`) and throws `AppError(400)` on validation failure.
- **Async wrapper**: `asyncHandler(fn)` catches and forwards errors to global filter.

**User endpoints**
- **GET /user/me**
  - **Auth**: required.
  - **Flow**: `authMiddleware` -> controller returns `req.user` data.
  - **Uses**: quick user info endpoint for frontends.

**Account endpoints**
- **GET /account/me**
  - **Auth**: required.
  - **Flow**: `AccountController.getMe` -> `AccountService.getMe` -> `GetMeUseCase` -> `PrismaAccountRepository.getMe`.
  - **DB**: reads `Account` model via Prisma.
- **POST /account/create**
  - **Auth**: required.
  - **Flow**: `AccountController.createAccount` -> create use case -> repository -> Prisma `create`.
- **PATCH /account/settings**
  - **Auth** & **validation**: `UpdateAccountDto`.
  - **Flow**: `AccountController.updateAccountSettings` -> `UpdateAccountUseCase` -> repository update.

**Calendar endpoints**
- **POST /calendar/** (create)
  - **Auth** & **validation**: `CreateCalendarDto` (body: `provider`, `apiKey`).
  - **Flow**: `CalendarController.createCalendar` -> `CreateCalendarUseCase` -> `CalendarService.createCalendar` -> `PrismaCalendarRepository.create`.
  - **DB**: creates `Calendar` record with `userId`, `accountId`, `provider`, `apiKey`.
- **PATCH /calendar/:id** (update)
  - **Auth** & **validation**: `UpdateCalendarDto` (body: `apiKey`).
  - **Flow**: update use case -> repository `update`.
- **GET /calendar/collection**
  - **Auth**: returns list by `userId` -> repository `findByUserId`.
- **GET /calendar/:id**
  - **Auth**: returns single calendar -> repository `findById`.
- **DELETE /calendar/:id**
  - **Auth**: calls `CalendarService.deleteCalendar`.

**Cal Webhooks**
- **Routes**: `POST /webhooks/cal` (incoming events), `POST /webhooks/cal/create` (creates webhook for user)
- **Create webhook flow** (`/webhooks/cal/create`):
  - **Auth** required.
  - Controller calls `createCalWebhook(res, next, apiKey)` which POSTs to `CAL_WEBHOOK_CREATION_URL` with user's `apiKey` and registers subscriber URL (app webhook endpoint).
- **Incoming webhook flow** (`/webhooks/cal`):
  - **No auth** for externally delivered events.
  - Handler parses event `{ triggerEvent, payload }` and routes to specific handlers:
    - `BOOKING_CREATED` / `BOOKING_RESCHEDULED` -> `scheduledBookingsHandler`
    - `BOOKING_CANCELLED` -> `canceledBookingsHandler`
  - Each handler performs Prisma transactions creating/updating `Booking` and pushing `Outbox` entries as needed.

**Booking handlers (high level)**
- **scheduledBookingsHandler**
  - Upserts `Booking` by `bookingId` and inserts `Outbox` reminder entries for matching accounts.
  - Uses `prisma.$transaction` to keep DB consistent.
- **canceledBookingsHandler**
  - Marks booking as called/processed and updates `Outbox` entries to processed where `payload.bookingId` matches.

**Reminder Cron**
- **File**: `infrastructure/cron/reminder.cron.ts` (started from `src/app.ts`).
- **Schedule**: runs every minute (`* * * * *`).
- **Locking**: uses `acquireLock(name)` which attempts to `prisma.cronLock.create` — creation succeeds only if no lock exists. If lock exists, cron exits early.
- **Processing**:
  - Queries `Outbox` where `{ type: "REMINDER", processed: false, reminderAt: { lte: now } }`.
  - For each reminder, performs sending (e.g., call to `VAPI_CALL_URL`) and marks outbox `processed: true` and/or updates `Booking` accordingly inside transactions.
- **Unlock**: calls `releaseLock(name)` which deletes the lock row.

**Prisma interactions**
- **Client**: custom Prisma client at `prisma/prisma.service.ts` configured with `PrismaPg` adapter and `env.DATABASE_URL`.
- **Models used**: `Account`, `Calendar`, `Booking`, `Outbox`, `CronLock`.
- **Patterns**: repository classes encapsulate direct Prisma calls (e.g., `PrismaCalendarRepository`, `PrismaAccountRepository`); services/usecases call repositories.

**Logging & Observability**
- **Logger**: `pino` with `pino-pretty` in non-prod.
- **HTTP**: `httpLogger` (pino-http) middleware attached in `src/app.ts`.
- **Slow query detection**: Prisma client emits `query` events and logs queries > 200ms.

**Examples**
- Create calendar request (client -> API):

  POST /calendar/
  Body: { "provider": "cal", "apiKey": "user_api_key" }

  Response: 201 Created with calendar record details.

- Webhook event (external -> API):

  POST /webhooks/cal
  Body: { "triggerEvent": "BOOKING_CREATED", "payload": { "bookingId": "123", "startTime": "...", "organizer": {...} } }

  Response: 200 OK
