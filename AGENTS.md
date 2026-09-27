# ThreadHive Backend

## Project Shape

- `main.js` loads environment variables, connects to MongoDB, and starts the server.
- `server.js` owns the HTTP listener; `src/app.js` owns Express middleware and route mounting.
- Request flow is `src/routes/` -> `src/controllers/` -> `src/services/` -> `src/models/`.
- Keep business logic in services, request/response handling in controllers, and persistence schemas in models.
- Shared middleware lives in `src/middleware/`; reusable application errors belong in `src/utils/createAppError.js`.

## Commands

- `npm install` installs dependencies.
- `npm run dev` starts the server with Nodemon.
- `npm start` starts the server with Node.
- `npm test` runs Vitest tests.
- `npm run populate` connects to MongoDB, clears the application collections, and loads seed data.
- `npm run format` formats the repository with Prettier.

Before starting the app or population script, configure `MONGODB_URI`, `PORT`, `JWT_SECRET`, and `NODE_ENV` in `.env`; `.env.example` shows the expected names and defaults.

## Conventions

- Use ES modules and include `.js` extensions in local imports.
- Controllers should validate request data and use `createAppError` for expected failures; the final Express error middleware formats failures.
- Protected routes use `authHandler` and downstream code expects the authenticated user ID at `req.user.userId`.
- Preserve the existing security middleware in `src/app.js` (Helmet, CORS, rate limiting, and JSON/body limits) when changing application setup.
- Add or update focused tests for route, controller, service, and model behavior as appropriate, then run `npm test`.

## Current Wiring Notes

- The auth route import and `/api/auth` mount are currently commented out in `src/app.js`.
- `src/middleware/authHandler.js` is currently a stub, so authentication behavior is incomplete until it is implemented.
- Check async error propagation when adding controllers; route handlers currently do not show a shared async wrapper.

See [README.md](README.md) for the repository's existing project note.
