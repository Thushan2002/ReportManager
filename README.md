# Report Manager

Full-stack project with a React frontend and an Express + MongoDB backend for managing reports, projects, and team activity.

## Prerequisites

Before you start, make sure you have the following installed:

- Node.js 18+ and npm
- MongoDB running locally or via Docker
- A Gemini API key for the AI assistant features

## 1) Installing dependencies

Open two terminals in the project root:

### Frontend

```bash
cd client
npm install
```

### Backend

```bash
cd server
npm install
```

## 2) Running the frontend

From the client folder:

```bash
cd client
npm run dev
```

The app should start on:

- http://localhost:5173

The Vite config proxies `/api` requests to the backend at `http://localhost:5000`.

## 3) Running the backend

From the server folder:

```bash
cd server
cp .env.example .env
```

Then update the values in `.env` as needed:

```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/report-manager
JWT_SECRET=replace-with-a-long-random-secret
JWT_EXPIRES_IN=1d
CLIENT_ORIGIN=http://localhost:5173
GEMINI_API_KEY=paste-your-gemini-api-key-here
GEMINI_MODEL=gemini-3.6-flash
LOG_LEVEL=info
```

Then run:

```bash
cd server
npm run dev
```

The API will run on:

- http://localhost:5000

You can check the health endpoint:

```bash
curl http://localhost:5000/health
```

## 4) Running the database

This project expects MongoDB to be available.

### Option A: Local MongoDB installation

If MongoDB is installed locally, start it with:

```bash
mongod
```

The default connection string used by the app is:

```bash
mongodb://127.0.0.1:27017/report-manager
```

### Option B: Docker MongoDB

```bash
docker run -d \
  --name report-manager-mongo \
  -p 27017:27017 \
  -v mongo_data:/data/db \
  mongo:latest
```

Then make sure your `.env` file uses:

```env
MONGODB_URI=mongodb://127.0.0.1:27017/report-manager
```

## Other useful commands

### Build frontend for production

```bash
cd client
npm run build
```

### Preview production frontend build

```bash
cd client
npm run preview
```

### Start backend without watch mode

```bash
cd server
npm start
```

### Run tests

```bash
cd server
npm test
```

## Project startup summary

In most cases, use these commands in separate terminals:

```bash
cd server
npm install
cp .env.example .env
npm run dev
```

```bash
cd client
npm install
npm run dev
```

Make sure MongoDB is running before starting the backend.

## Troubleshooting

- If the backend cannot connect to MongoDB, verify the `MONGODB_URI` value in `.env`.
- If the frontend cannot talk to the API, confirm the backend is running on port `5000` and the proxy is configured in Vite.
- If AI features fail, ensure `GEMINI_API_KEY` is set correctly in the backend `.env` file.
- If you see CORS errors, confirm `CLIENT_ORIGIN` matches the frontend URL, usually `http://localhost:5173`.
