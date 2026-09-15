# Dept Social API

Backend for a department-scoped social feed app (posts, statuses, comments, likes) built for university students. Node.js, Express, and MongoDB, with school-email-verified signup, JWT auth via httpOnly cookies, and image uploads through Cloudinary.

## Tech stack

- **Runtime**: Node.js + Express
- **Database**: MongoDB + Mongoose
- **Auth**: JWT (httpOnly cookies), bcrypt password hashing
- **Image storage**: Cloudinary (avatars, post/status images)
- **File handling**: Multer (memory storage, streamed to Cloudinary)

## Features

- Signup gated behind school-email verification (6-digit code sent via email)
- Login/logout with JWT stored in an httpOnly, secure, cross-site cookie
- Session persistence via `/api/auth/me`
- Posts: create (with optional image), read (feed + single), update, delete, like
- Statuses: create (with optional image), read, delete, like — powers a stories-style feature
- Comments on posts
- Profile: update username, upload/replace avatar (auto-resized and compressed via Cloudinary)

## Getting started

```bash
git clone https://github.com/aderogbasamuel/dept-social-api/
cd dept-social-api
npm install
cp .env.example .env   # fill in real values, see below
npm run dev
```

Server runs on `http://localhost:5000` by default (or whatever `PORT` is set to).

## Environment variables

```
PORT=5000
MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/dept-social
JWT_SECRET=replace_with_a_long_random_string

# Allowed origins for CORS (comma-separate if you need more than one)
CLIENT_URL=http://localhost:5173

# Email (Nodemailer) — used for signup verification codes
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your_smtp_user
SMTP_PASS=your_smtp_pass
EMAIL_FROM=Dept Social <no-reply@example.com>

# Cloudinary — used for avatar and post/status image uploads
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

## API reference

All authenticated routes expect the `token` cookie set by `/api/auth/login` — no `Authorization` header needed, the browser sends it automatically once logged in.

### Auth — `/api/auth`

| Method | Route | Auth | Description |
|---|---|---|---|
| POST | `/signup` | — | Register with school email; sends a verification code |
| POST | `/verify-email` | — | Confirm the code, activates the account |
| POST | `/login` | — | Log in, sets the `token` cookie |
| GET | `/me` | ✅ | Returns the current logged-in user |
| POST | `/logout` | — | Clears the auth cookie |

### Posts — `/api/posts`

| Method | Route | Auth | Description |
|---|---|---|---|
| GET | `/` | — | Get all posts (feed) |
| GET | `/:id` | — | Get a single post |
| POST | `/` | ✅ | Create a post — `multipart/form-data`, fields: `text`, optional `image` |
| PUT | `/:id` | ✅ (author only) | Edit a post's text — editable within 15 minutes of creation |
| DELETE | `/:id` | ✅ (author only) | Delete a post |
| POST | `/:id/like` | ✅ | Toggle like on a post |

### Comments — `/api/comments`

| Method | Route | Auth | Description |
|---|---|---|---|
| GET | `/:postId` | ✅ | Get comments for a post |
| POST | `/` | ✅ | Add a comment — body: `{ postId, content }` |

### Statuses — `/api/statuses`

| Method | Route | Auth | Description |
|---|---|---|---|
| GET | `/` | — | Get all statuses |
| GET | `/:id` | — | Get a single status |
| POST | `/` | ✅ | Create a status — `multipart/form-data`, fields: `text`, optional `image` |
| DELETE | `/:id` | ✅ (author only) | Delete a status |
| POST | `/:id` | ✅ | Toggle like on a status |

### Users — `/api/users`

| Method | Route | Auth | Description |
|---|---|---|---|
| PATCH | `/username` | ✅ | Update your username |
| POST | `/avatar` | ✅ | Upload/replace your avatar — `multipart/form-data`, field: `avatar` |

## Deployment (Render)

- **Build command**: `npm install`
- **Start command**: `npm start` (or `node server.js`)
- Add all env vars above in Render's dashboard under **Environment** — local `.env` files aren't read in production
- Cookie settings (`secure: true`, `sameSite: "none"`) are required since the frontend and backend run on different domains — see `authController.js`

## Known limitations / next steps

- No pagination on `GET /posts` or `GET /statuses` yet — fine for small usage, will need `?page=&limit=` once the feed grows
- No rate limiting on auth routes — worth adding (`express-rate-limit`) to prevent verification-code brute forcing
- No department-based scoping yet — currently a single shared feed; a `department`/`communityId` field would let this expand into multiple communities later

