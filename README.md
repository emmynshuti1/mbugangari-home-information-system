# 🏡 Mbugangari Home Information System

The **Mbugangari Home Information System** is a full-stack web application developed to digitally document and present information about a residential home located in Mbugangari Village, Rubavu District, Rwanda. The system provides visitors with detailed information about the house, including its rooms, construction materials, historical events, nearby places, and a photo gallery. It also includes an administrator dashboard for securely managing all application data.

The project was developed using modern web technologies including HTML, CSS, JavaScript, Node.js, Express.js, PostgreSQL (Neon), and JWT authentication.

---

# Features

## Public Features

- View information about the home
- Browse rooms and their descriptions
- Explore the construction materials used
- View the home's historical timeline
- Browse nearby places
- View image gallery
- Responsive design for desktop and mobile devices

## Administrator Features

- Secure administrator login using JWT
- Manage house information
- Add, edit and delete rooms
- Manage gallery images
- Manage construction materials
- Manage history records
- Manage nearby places
- Upload images

---

# Technologies Used

## Frontend

- HTML5
- CSS3
- JavaScript (Vanilla)

## Backend

- Node.js
- Express.js

## Database

- PostgreSQL
- Neon Database

## Authentication

- JSON Web Token (JWT)
- bcrypt

## Deployment

- Render (Frontend)
- Render (Backend)
- Neon (Database)

---

# Project Structure

```
Mbugangari Home Information System
│
├── client
│   ├── admin
│   ├── css
│   ├── images
│   ├── js
│   ├── pages
│   └── index.html
│
├── server
│   ├── config
│   ├── controllers
│   ├── middleware
│   ├── models
│   ├── routes
│   ├── uploads
│   ├── utils
│   ├── app.js
│   └── package.json
│
├── database
│   └── schema.sql
│
└── README.md
```

---

# Database Schema

The application uses the following tables:

- houses
- rooms
- gallery
- materials
- history
- nearby_places
- administrators

Relationships are enforced using PostgreSQL foreign keys with cascade deletion.

---

# Installation

## 1. Clone the repository

```bash
git clone https://github.com/emmynshuti1/mbugangari-home-information-system.git

cd mbugangari-home-information-system
```

---

## 2. Install backend dependencies

```bash
cd server

npm install
```

---

## 3. Configure Environment Variables

Create a `.env` file inside the **server** directory.

Example:

```env
DATABASE_URL=your_neon_database_connection_string
JWT_SECRET=your_secret_key
PORT=5000
```

---

## 4. Create the database

Execute the SQL script:

```
database/schema.sql
```

using PostgreSQL or Neon SQL Editor.

---

## 5. Start the backend

```bash
npm run dev
```

or

```bash
npm start
```

---

## 6. Run the frontend

Open the **client** folder using VS Code Live Server or any local web server.

---

# API Endpoints

## Authentication

```
POST /api/auth/login
```

## Houses

```
GET    /api/houses
POST   /api/houses
PUT    /api/houses/:id
DELETE /api/houses/:id
```

## Rooms

```
GET    /api/rooms
POST   /api/rooms
PUT    /api/rooms/:id
DELETE /api/rooms/:id
```

## Gallery

```
GET    /api/gallery
POST   /api/gallery/upload
DELETE /api/gallery/:id
```

## Materials

```
GET
POST
PUT
DELETE
```

```
/api/materials
```

## History

```
GET
POST
PUT
DELETE
```

```
/api/history
```

## Nearby Places

```
GET
POST
PUT
DELETE
```

```
/api/nearby-places
```

---

# Security

The application includes:

- Password hashing using bcrypt
- JWT authentication
- Helmet security middleware
- CORS protection
- Login rate limiting
- Environment variables for sensitive credentials

---

# Deployment

Frontend:

- Netlify

Backend:

- Render

Database:

- Neon PostgreSQL

---

# Future Improvements

- Password recovery
- Administrator management
- Search functionality
- Image optimization
- Activity logs
- Unit and integration tests
- Audit logging
- Email notifications
- Interactive maps

---

# Author

**Emmanuel Nshuti**

Computer Science Student

Rwanda

---

# License

This project was developed for educational purposes as part of a web development learning project.
