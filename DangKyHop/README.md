# DangKyHop - Vite + React + Tailwind + Firebase

This project is a modern web application built with Vite, React, Tailwind CSS, and Firebase.

## Features

- ⚡ Vite for fast development
- ⚛️ React for UI components
- 🎨 Tailwind CSS for styling
- 🔥 Firebase for backend services (Auth, Firestore, Storage)
- 📱 Responsive design

## Project Structure

```
DangKyHop/
├── src/
│   ├── assets/          # Static assets (images, icons)
│   ├── components/      # Reusable React components
│   ├── firebaseConfig.js # Firebase configuration
│   ├── App.jsx          # Main app component
│   ├── main.jsx         # App entry point
│   └── index.css        # Global styles with Tailwind
├── .env                 # Environment variables
├── tailwind.config.js   # Tailwind configuration
├── postcss.config.js    # PostCSS configuration
└── package.json         # Dependencies and scripts
```

## Getting Started

1. Clone or navigate to the project directory
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up Firebase:
   - Create a Firebase project at https://console.firebase.google.com/
   - Update `.env` with your Firebase config
4. Start the development server:
   ```bash
   npm run dev
   ```
5. Open http://localhost:5173 in your browser

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

Then open http://localhost:5173 in your browser.
