# 🏡 Mbugangari Home Information System

The **Mbugangari Home Information System** is a full-stack web application that documents and presents a residential home in Mbugangari Village, Rubavu District, Rwanda. Visitors can explore the house, its rooms, construction materials, history, nearby places and a photo gallery. Administrators manage all of this content from a secure admin portal.

Built with HTML, CSS and vanilla JavaScript on the frontend, Node.js + Express on the backend, PostgreSQL (Neon) for storage, and JWT authentication.

---

## Features

### Public website

- Homepage with a hero photo, key facts (year built, rooms, floor area, nearest landmark), featured rooms, a photo mosaic, recent history and nearby places
- **The House** page with full details, location and an OpenStreetMap map
- **Rooms** with search, floor filter, sorting, dimensions/area and a full-screen viewer
- **Gallery** with caption search and a keyboard/swipe-friendly lightbox
- **Materials**, **History** timeline and **Nearby Places** (category filter, distances, walking time)
- All content and images load from the API; loading skeletons, empty states and retryable error states everywhere
- Responsive from 320 px phones to wide desktops, light and dark themes, reduced-motion support
- Accessibility: semantic landmarks, skip link, keyboard navigation, focus styles, alt text from captions
- SEO: per-page titles and descriptions, Open Graph tags, canonical URLs, `robots.txt`, `sitemap.xml`, friendly 404 page

### Administration portal (`/admin/login.html`)

- Session verified against the API on every page; expired sessions redirect to sign-in with a message
- **Dashboard** with live statistics, a content checklist (missing photos, captions, dates…), recent activity and latest uploads
- **House**: edit details, coordinates and a homepage cover photo
- **Rooms, Gallery, Materials, History, Nearby Places**: create, view, edit and delete, with search, filters and sortable columns
- Image uploads: drag-and-drop or file picker, preview before upload, replace an existing image when editing, upload progress, type/size checks, automatic downscaling of very large photos and conversion of unsupported formats (e.g. AVIF) in the browser
- Inline form validation, success/error toasts, confirmation dialogs for deletes and unsaved changes

---

## Project structure

```
client/                 Website and admin portal (static files served by Express)
  admin/                Admin pages
  css/style.css         Public website styles
  css/admin.css         Admin portal styles
  js/                   config, api client, shared site/admin modules, page scripts
  images/               Original photos (used once to seed the database)
server/
  app.js                Express app (API + static website)
  config/               Database pool, uploads (multer), startup migrations
  controllers/ models/ routes/ middleware/ utils/
  scripts/createAdmin.js
  tests/                Unit tests (node:test)
database/
  schema.sql  seed.sql
render.yaml             Render deployment blueprint
```

---

## Running locally

Requirements: Node.js 18 or newer and a PostgreSQL database (Neon or local).

```bash
cd server
npm install
cp .env.example .env        # then edit the values
```

`.env`:

```env
DATABASE_URL=postgresql://user:password@host/database
JWT_SECRET=a-long-random-secret-of-at-least-16-characters
PORT=5000
NODE_ENV=development
CORS_ORIGIN=http://localhost:5500
```

> ⚠️ If `DATABASE_URL` points at the production Neon database, local changes edit live data. Use a separate Neon branch or a local PostgreSQL database for development.

For a new database, run `database/schema.sql` (and optionally `database/seed.sql`). Existing databases are upgraded automatically on startup with additive, idempotent changes (new image columns and the `activity_log` table); no data is removed.

Create or reset an administrator (the password is never stored in the repository):

```bash
ADMIN_NAME="Your Name" ADMIN_EMAIL=you@example.com ADMIN_PASSWORD="a long password" npm run create-admin
```

On Windows PowerShell:

```powershell
$env:ADMIN_NAME="Your Name"; $env:ADMIN_EMAIL="you@example.com"; $env:ADMIN_PASSWORD="a long password"; npm run create-admin
```

Start the server and open <http://localhost:5000>:

```bash
npm run dev     # with auto-reload
npm start       # production mode
npm test        # unit tests
```

The website is served by the same Express server. If you prefer VS Code Live Server (port 5500), it automatically calls the API on port 5000.

---

## Deployment (Render + Neon)

One Render **web service** serves both the website and the API.

1. Push to GitHub. Either apply `render.yaml` as a Blueprint, or configure the existing service with:
   - Root directory: `server`
   - Build command: `npm ci --omit=dev`
   - Start command: `npm start`
   - Health check path: `/health`
2. Set environment variables in Render: `DATABASE_URL` (Neon connection string), `JWT_SECRET` (long random value), `NODE_ENV=production`, and `CORS_ORIGIN` only if another site must call the API.
3. Deploy. On startup the server applies the additive migrations and serves the site at the service URL.

To host the frontend elsewhere, set `window.MBUGANGARI_API_ORIGIN = "https://your-api.onrender.com"` before `js/config.js` loads and add that site's origin to `CORS_ORIGIN`.

---

## API

All write endpoints require `Authorization: Bearer <token>`. Errors return `{ success: false, message }` with an appropriate status (400 validation, 401 auth, 404 not found).

| Method | Endpoint | Notes |
| --- | --- | --- |
| POST | `/api/auth/login` | `{ email, password }` → token (rate-limited: 5 failed attempts / 15 min) |
| GET | `/api/auth/me` | Current administrator |
| GET | `/api/activity?limit=15` | Recent administrator changes (protected) |
| GET/POST | `/api/houses` | POST accepts JSON or multipart with optional `image` (cover photo) |
| GET/PUT/DELETE | `/api/houses/:id` | Deleting a house deletes all its content |
| GET | `/api/houses/:id/image` | Cover photo |
| GET/POST | `/api/rooms` | Multipart with `image` |
| GET/PUT/DELETE | `/api/rooms/:id` | PUT replaces the image only when a new `image` is sent |
| GET | `/api/rooms/:id/image` | |
| GET/POST | `/api/gallery` (also `POST /api/gallery/upload`) | Multipart: `image`, `caption`, optional `house_id` |
| GET/PUT/DELETE | `/api/gallery/:id` | PUT updates the caption and optionally replaces the image |
| GET | `/api/gallery/:id/image` | |
| GET/POST, GET/PUT/DELETE | `/api/materials`, `/api/history`, `/api/nearby-places` (+ `/:id`) | JSON |
| GET | `/health` | Database health check |

Images are stored in PostgreSQL and served with long-lived caching; their URLs include a version (`?v=`) that changes whenever an image is replaced. Uploads must be JPEG, PNG, GIF or WEBP (verified by file signature), up to 10 MB.

---

## Security

- bcrypt password hashing, JWT (HS256, 24 h) with server-side session verification
- Every create/update/delete route requires authentication
- Server-side validation of all input (types, lengths, ranges, dates, ids) and image file signatures
- Helmet security headers with a Content-Security-Policy, CORS allow-list, login rate limiting
- All user content is rendered with `textContent` (no HTML injection)
- Secrets live only in environment variables (`.env` is git-ignored)

---

## Author

**Emmanuel Nshuti**, Computer Science Student, Rwanda

## License

This project was developed for educational purposes as part of a web development learning project.
