# ThreadHive Backend

ThreadHive Backend is a REST API for a Reddit-style discussion platform. It provides user authentication, subreddit and thread management, comments, and upvote/downvote functionality backed by MongoDB.

## Features

- Register and authenticate users with bcrypt password hashing and JWTs
- Create, read, update, and delete discussion threads
- Create subreddits and retrieve their threads
- Add and retrieve comments for threads
- Upvote and downvote threads and comments
- Request validation and consistent JSON error responses
- Security middleware with Helmet, CORS, JSON body limits, and rate limiting
- MongoDB seed data for local development

## Tech Stack

- Node.js with ES modules
- Express 5
- MongoDB with Mongoose
- JSON Web Tokens for authentication
- bcryptjs for password hashing
- Vitest, Supertest, and MongoDB Memory Server for tests
- Nodemon and Prettier for development

## Architecture

Requests flow through Express routes to controllers, services, and Mongoose models:

```text
Client
	-> Express routes and middleware
	-> Controllers
	-> Services
	-> Mongoose models
	-> MongoDB
```

`main.js` loads environment variables, connects to MongoDB, and starts the HTTP server. `src/app.js` configures middleware and mounts the API routes.

## Project Structure

```text
.
├── main.js                 # Application entry point
├── server.js               # HTTP server lifecycle
├── db.js                   # MongoDB connection helpers
├── src/
│   ├── app.js              # Express app and route mounting
│   ├── controllers/        # Request and response handling
│   ├── middleware/         # Authentication and error handling
│   ├── models/             # Mongoose schemas
│   ├── routes/             # API route definitions
│   ├── services/           # Business logic and persistence operations
│   ├── scripts/            # Database population and seed data
│   └── utils/              # Shared application utilities
└── tests/                  # Automated API tests
```

## Getting Started

### Prerequisites

- Node.js 18 or later
- MongoDB running locally or a MongoDB connection string
- npm

### Installation

```bash
git clone <repository-url>
cd threadhive-backend-wk4
npm install
```

Create a `.env` file in the project root:

```env
MONGODB_URI=mongodb://localhost:27017/w04Express
PORT=5000
JWT_SECRET=replace-with-a-long-random-secret
NODE_ENV=development
```

| Variable | Description |
| --- | --- |
| `MONGODB_URI` | MongoDB connection string |
| `PORT` | Port used by the HTTP server; defaults to `3000` |
| `JWT_SECRET` | Secret used to sign and verify JWTs |
| `NODE_ENV` | Set to `development` to include error stacks in responses |

### Running the App

Start the development server with automatic restarts:

```bash
npm run dev
```

Start the application normally:

```bash
npm start
```

The API is available at `http://localhost:5000` when using the example configuration.

### Seed the Database

The population script deletes existing users, subreddits, threads, and comments before inserting the sample dataset. Make sure `MONGODB_URI` is configured before running it:

```bash
npm run populate
```

Use this command only against a development database because it is destructive.

## Authentication

Register or log in to receive a JWT:

```bash
curl -X POST http://localhost:5000/api/auth/register \
	-H 'Content-Type: application/json' \
	-d '{"name":"Ada Lovelace","email":"ada@example.com","password":"strong-password"}'
```

Send the returned token with protected requests:

```text
Authorization: Bearer <token>
```

Tokens expire after seven days. Registration and login are public; all thread, subreddit, comment, and vote endpoints require a valid bearer token.

## API Endpoints

All responses are JSON. Successful responses include `success: true`, a `message`, and usually a `data` property. Errors include `success: false` and a `message`.

### Authentication

| Method | Route | Description | Auth |
| --- | --- | --- | --- |
| `POST` | `/api/auth/register` | Register with `name`, `email`, and `password` | No |
| `POST` | `/api/auth/login` | Log in with `email` and `password` | No |

### Threads

| Method | Route | Description | Auth |
| --- | --- | --- | --- |
| `GET` | `/api/threads` | List all threads | Yes |
| `GET` | `/api/threads/:id` | Get one thread | Yes |
| `POST` | `/api/threads` | Create a thread with `title`, `content`, and `subreddit` | Yes |
| `PUT` | `/api/threads/:id` | Update a thread with fields from the request body | Yes |
| `DELETE` | `/api/threads/:id` | Delete a thread | Yes |

### Subreddits

| Method | Route | Description | Auth |
| --- | --- | --- | --- |
| `GET` | `/api/subreddits` | List all subreddits | Yes |
| `POST` | `/api/subreddits` | Create a subreddit with `name` and `description` | Yes |
| `GET` | `/api/subreddits/:id` | Get a subreddit and its threads | Yes |

### Comments

| Method | Route | Description | Auth |
| --- | --- | --- | --- |
| `GET` | `/api/comments/thread/:threadId` | List comments for a thread | Yes |
| `POST` | `/api/comments` | Add a comment with `thread` and `content` | Yes |

### Votes

| Method | Route | Description | Auth |
| --- | --- | --- | --- |
| `POST` | `/api/threads/:id/upvote` | Upvote a thread | Yes |
| `POST` | `/api/threads/:id/downvote` | Downvote a thread | Yes |
| `POST` | `/api/comments/:id/upvote` | Upvote a comment | Yes |
| `POST` | `/api/comments/:id/downvote` | Downvote a comment | Yes |

## Testing and Formatting

Run the automated test suite:

```bash
npm test
```

Format the repository with Prettier:

```bash
npm run format
```

## License

This project is licensed under the ISC License as declared in `package.json`.
