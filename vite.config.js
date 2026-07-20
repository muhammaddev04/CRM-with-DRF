import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// The Django backend (manage.py runserver) is expected at this origin.
// Override with VITE_API_PROXY_TARGET if the backend runs elsewhere.
const backendTarget = process.env.VITE_API_PROXY_TARGET || 'http://127.0.0.1:8000'

// Every path segment the Django backend actually serves (accounts.urls + crm.urls).
// Forwarding only these exact prefixes lets the SPA own every other route
// (e.g. /students inside the app shell) without colliding with the API.
const backendPathPrefixes = [
  '/auth', // accounts app: register/login/refresh
  '/student', // /students/, /student/:id/, /student-create/, /student-update/:id/, /student-delete/:id/
  '/mentor', // /mentors/, /mentor/:id/, /mentor-create/, ...enrolls...
  '/course',
  '/group',
  '/timetable',
  '/activity',
  '/grade', // also covers /grade-exams/, /grade-exam/... (shares the prefix)
  '/admin',
  '/swagger',
  '/redoc',
]

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    proxy: Object.fromEntries(
      backendPathPrefixes.map((prefix) => [
        prefix,
        { target: backendTarget, changeOrigin: true },
      ])
    ),
  },
})
