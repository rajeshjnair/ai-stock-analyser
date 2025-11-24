# AI Stock Analyser - Frontend App

This is the main React application for the AI Stock Analyser platform.

## Tech Stack

- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **React Router** - Client-side routing
- **Tailwind CSS** - Styling
- **Firebase Auth** - Authentication (Google Sign-In)
- **Axios** - HTTP client
- **WebSocket** - Real-time stock data

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Firebase project with Google Auth enabled
- Backend API running (see `apps/backend-api`)

### Installation

1. Install dependencies:
```bash
npm install
```

2. Copy `.env.example` to `.env` and fill in your Firebase credentials:
```bash
cp .env.example .env
```

3. Update the `.env` file with your Firebase configuration and API URLs.

### Development

Start the development server:
```bash
npm run dev
```

The app will be available at `http://localhost:3000`.

### Build

Build for production:
```bash
npm run build
```

Preview the production build:
```bash
npm run preview
```

## Features

- **Authentication**: Google Sign-In via Firebase
- **Dashboard**: View major stocks with live prices, search for stocks, and see recent analyses
- **Stock Analysis**: Detailed AI-powered analysis with real-time trade data
- **Watchlist**: Save and track your favorite stocks
- **Real-time Data**: WebSocket connection to backend for live stock prices

## Project Structure

```
src/
├── components/       # Reusable UI components
├── context/         # React context providers (Auth)
├── hooks/           # Custom React hooks (useWebSocket)
├── pages/           # Page components (Dashboard, Login, etc.)
├── services/        # API and Firebase services
├── types.ts         # TypeScript type definitions
├── App.tsx          # Main app component with routing
└── main.tsx         # App entry point
```

## Environment Variables

- `VITE_FIREBASE_API_KEY` - Firebase API key
- `VITE_FIREBASE_AUTH_DOMAIN` - Firebase auth domain
- `VITE_FIREBASE_PROJECT_ID` - Firebase project ID
- `VITE_FIREBASE_STORAGE_BUCKET` - Firebase storage bucket
- `VITE_FIREBASE_MESSAGING_SENDER_ID` - Firebase messaging sender ID
- `VITE_FIREBASE_APP_ID` - Firebase app ID
- `VITE_API_BASE_URL` - Backend API base URL
- `VITE_WS_URL` - WebSocket server URL

## Docker

Build the Docker image:
```bash
docker build -t stock-analyser-app .
```

Run the container:
```bash
docker run -p 80:80 stock-analyser-app
```

## Notes

- The app connects to the backend API via REST and WebSocket
- WebSocket connects to the backend, which aggregates data from Finnhub
- All routes except `/login` require authentication
- Auth tokens are automatically added to API requests via Axios interceptor
