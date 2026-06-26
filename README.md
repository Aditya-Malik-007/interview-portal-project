# Interview Experience Portal

A full-stack web application where students can share and browse interview experiences. Users register with their branch, post experiences for companies and roles, and explore a public feed of peer submissions.

Live demo: [interview-portal-project.vercel.app](https://interview-portal-project.vercel.app)

---

## Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Features](#features)
- [API Reference](#api-reference)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Database Setup](#database-setup)
  - [Backend Setup](#backend-setup)
  - [Frontend Setup](#frontend-setup)
- [Environment Variables](#environment-variables)
- [Scripts](#scripts)

---

## Overview

The Interview Experience Portal lets students document their placement and internship interview journeys. Authenticated users can create, edit, and delete their own posts. Anyone can browse the public feed filtered by company, role, or branch.

---

## Tech Stack

**Backend**
- Node.js with Express 5
- PostgreSQL via `pg` (connection pool)
- JWT-based authentication (`jsonwebtoken`)
- Password hashing with `bcrypt`
- `nodemon` for development hot-reload

**Frontend**
- React 19 with Vite
- React Router v7
- Bootstrap 5 for layout
- Axios for HTTP requests

---

## Project Structure

```
interview-experience-portal/
├── server.js           # Express API server
├── schema.sql          # PostgreSQL schema (users + posts)
├── package.json        # Backend dependencies
├── .env.example        # Environment variable template
└── frontend/
    ├── index.html
    ├── vite.config.js
    └── src/
        ├── main.jsx
        ├── App.jsx
        ├── index.css
        └── components/
            ├── Auth.jsx          # Login / Register forms
            ├── LandingPage.jsx   # Public landing page
            ├── Navbar.jsx        # Site navigation
            ├── Feed.jsx          # Public experiences feed
            ├── CreatePost.jsx    # Post submission form
            ├── Dashboard.jsx     # User's own posts management
            └── Profile.jsx       # User profile view
```

---

## Features

- User registration and login with JWT tokens (7-day expiry)
- Secure password storage using bcrypt
- Create, edit, and delete interview experience posts
- Public feed showing all experiences, ordered by most recent
- Personal dashboard to manage your own submissions
- Profile page with account details
- Owner-only edit and delete enforcement on the backend
- CORS restricted to the deployed frontend origin

---

## API Reference

All protected routes require an `Authorization: Bearer <token>` header.

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | `/register` | No | Register a new user |
| POST | `/login` | No | Log in and receive a JWT |
| POST | `/logout` | No | Client-side token removal |
| GET | `/api/check-auth` | Yes | Validate current token |
| GET | `/api/me` | Yes | Get authenticated user profile |
| GET | `/api/experiences` | No | Fetch all posts (public feed) |
| GET | `/api/my-posts` | Yes | Fetch posts by the logged-in user |
| POST | `/api/experiences` | Yes | Create a new post |
| PUT | `/api/experiences/:id` | Yes | Edit a post (owner only) |
| DELETE | `/api/experiences/:id` | Yes | Delete a post (owner only) |

---

## Getting Started

### Prerequisites

- Node.js 18 or later
- PostgreSQL 14 or later
- npm

### Database Setup

1. Create a PostgreSQL database:

```sql
CREATE DATABASE interview_portal;
```

2. Run the schema to create the tables:

```bash
psql -U <your_user> -d interview_portal -f schema.sql
```

### Backend Setup

1. Clone the repository:

```bash
git clone https://github.com/Aditya-Malik-007/interview-portal-project.git
cd interview-experience-portal
```

2. Install backend dependencies:

```bash
npm install
```

3. Copy the environment template and fill in your values:

```bash
cp .env.example .env
```

4. Start the development server:

```bash
npm start
```

The API will be available at `http://localhost:4000`.

### Frontend Setup

1. Navigate to the frontend directory:

```bash
cd frontend
```

2. Install frontend dependencies:

```bash
npm install
```

3. Start the Vite dev server:

```bash
npm run dev
```

The frontend will be available at `http://localhost:5173`.

---

## Environment Variables

Copy `.env.example` to `.env` in the project root and set the following:

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Port the Express server listens on | `4000` |
| `PG_USER` | PostgreSQL username | - |
| `PG_PASSWORD` | PostgreSQL password | - |
| `PG_HOST` | PostgreSQL host | `localhost` |
| `PG_PORT` | PostgreSQL port | `5432` |
| `PG_DATABASE` | PostgreSQL database name | `interview_portal` |
| `JWT_SECRET` | Secret key used to sign JWT tokens | - |

`JWT_SECRET` must be set or the server will refuse to start.

---

## Scripts

**Backend** (run from project root)

| Command | Description |
|---------|-------------|
| `npm start` | Start backend with nodemon (auto-restart on changes) |

**Frontend** (run from `frontend/`)

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server |
| `npm run build` | Build for production |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint |
