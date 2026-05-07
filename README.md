# TaskForge-Frontend

# TaskForge Frontend

Frontend for the TaskForge project management application built using React, Vite, Tailwind CSS, and Axios.

---

## Features

- User Authentication UI
- Register/Login Pages
- Dashboard
- Create Projects
- Create Tasks
- Responsive Design
- JWT Token Handling
- Protected Routes
- Railway Deployment Ready

---

## Tech Stack

- React.js
- Vite
- Tailwind CSS
- Axios
- React Router DOM
- Context API

---

## Folder Structure

```bash
frontend/
│
├── src/
│   ├── api/
│   ├── components/
│   ├── context/
│   ├── pages/
│   ├── routes/
│   ├── utils/
│   └── main.jsx
│
├── public/
├── package.json
├── vite.config.js
└── README.md
```

---

## Environment Variables

Create a `.env` file in frontend root.

```env
VITE_API_URL=http://localhost:8080/api
```

### Production Variable

```env
VITE_API_URL=https://taskforge-backend-production-884e.up.railway.app/api
```

---

## Installation

```bash
npm install
```

---

## Run Locally

```bash
npm run dev
```

Frontend runs on:

```bash
http://localhost:5173
```

---

## Production Build

```bash
npm run build
```

---

## Preview Production Build

```bash
npm run preview
```

---

## Deployment

Frontend deployed using Railway.

### Railway Deployment Steps

1. Push frontend code to GitHub
2. Create Railway frontend service
3. Connect GitHub repository
4. Add frontend environment variables
5. Set build/start commands
6. Generate Railway domain
7. Deploy application

---

## Railway Commands

### Build Command

```bash
npm install && npm run build
```

### Start Command

```bash
npx serve -s dist -l tcp://0.0.0.0:$PORT
```

---

## Live Frontend URL

```bash
https://taskforge-frontend-production-a1dc.up.railway.app
```

---

## Live Backend URL

```bash
https://taskforge-backend-production-884e.up.railway.app
```

---

## Demo Credentials

```bash
Email: demo@gmail.com
Password: demo123
```

---

## Author

Ayush Parmar
