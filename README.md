# VaxTrack Frontend

A React-based frontend for **VaxTrack** — a national vaccination tracking and management system for Sri Lanka. Built with React 19, Vite 7, and Tailwind CSS v4.

## 🔗 Live URLs

| Service | URL |
|---|---|
| **Frontend** | *(add after deployment)* |
| **Backend API** | *(add after deployment)* |
| **API Docs (Swagger)** | `<backend-url>/api-docs` |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 19 (functional components + hooks) |
| Build Tool | Vite 7 |
| Styling | Tailwind CSS v4 |
| State Management | Zustand |
| Routing | React Router DOM v7 |
| Forms | React Hook Form |
| HTTP Client | Axios |
| Notifications | React Hot Toast |
| Testing | Vitest + React Testing Library |

---

## Project Structure

```
src/
├── api/              # Axios-based API modules (one per backend resource)
├── components/
│   ├── common/       # Reusable UI — Button, Table, Pagination, SearchBar, Modal…
│   └── layout/       # MainLayout, Sidebar, Navbar
├── hooks/            # Custom React hooks
├── pages/
│   ├── auth/         # LoginPage, RegisterPage
│   ├── appointments/ # AppointmentsPage, BookAppointmentPage, QueueBoardPage
│   ├── dashboard/    # DashboardPage (role-based widgets)
│   ├── dependents/   # DependentsPage
│   ├── hospitals/    # HospitalsPage
│   ├── clinics/      # ClinicsPage
│   ├── records/      # RecordsPage
│   ├── side-effects/ # MySideEffectsPage, AdminSideEffectsPage
│   ├── vaccines/     # VaccinesPage
│   ├── inventory/    # BatchesPage, InventoryDashboard
│   ├── profile/      # ProfilePage
│   └── history/      # HistoryPage
├── routes/           # ProtectedRoute, RoleRoute
├── store/            # Zustand stores (useAuthStore)
├── tests/            # Vitest setup
├── utils/            # Formatters, helpers
└── validators/       # Zod/custom validation schemas
```

---

## Getting Started

### Prerequisites

- **Node.js** >= 20
- VaxTrack backend running (see [backend README](../vaxtrack-backend/README.md))

### Installation

```bash
git clone <repository-url>
cd vaxtrack-frontend
npm install
```

### Environment Variables

Create a `.env` file in the root:

```env
VITE_API_URL=http://localhost:5000/api
```

| Variable | Description |
|---|---|
| `VITE_API_URL` | Base URL of the VaxTrack backend API |

### Running Locally

```bash
npm run dev
```

The app starts at `http://localhost:5173`.

---

## User Roles & Features

| Role | Navigation |
|---|---|
| **Public (Patient)** | Dashboard, My Appointments, Book Appointment, Find Hospital, My Records, My Dependents, Side Effects, Profile |
| **HospitalStaff** | Dashboard, Queue Board, Clinics, Batches, All Records, Side Effects |
| **Admin** | All of the above + Hospitals, Vaccines, Inventory Alerts |

### Key Features
- **4-step appointment booking wizard** — choose clinic → select patient → confirm → success + QR code
- **Queue management board** — staff can mark patients as Completed or No-Show in real time
- **Role-based sidebar** — navigation adapts automatically based on logged-in user role
- **JWT session persistence** — auth token stored via Zustand + localStorage, survives page refresh
- **Protected routes** — unauthenticated users are redirected to `/login` with return-URL state

---

## API Integration

All API calls go through `src/api/` modules. Each module wraps Axios and maps to a backend resource:

| Module | Endpoints Used |
|---|---|
| `authApi.js` | POST `/users/login`, POST `/users` |
| `appointmentApi.js` | CRUD `/appointments`, `/appointments/my`, `/appointments/clinic/:id` |
| `clinicApi.js` | GET `/clinics`, POST/PUT `/clinics` |
| `hospitalApi.js` | GET/POST `/hospitals` |
| `dependentApi.js` | CRUD `/users/dependents` |
| `recordApi.js` | GET `/records/history`, `/records/due` |
| `vaccineApi.js` | CRUD `/vaccines` |
| `sideEffectApi.js` | CRUD `/side-effects` |

The Axios instance (`src/api/axiosInstance.js`) automatically attaches the JWT `Authorization` header from the Zustand auth store.

---

## Deployment

### Platform: Vercel

1. Push the `main` branch to GitHub
2. Go to [vercel.com](https://vercel.com) → **Add New Project**
3. Import the `vaxtrack-frontend` GitHub repository
4. Framework preset: **Vite** (auto-detected)
5. Add environment variable:
   ```
   VITE_API_URL = https://vaxtrack-api.onrender.com/api
   ```
6. Click **Deploy**

### Live URLs

| | URL |
|---|---|
| Frontend | *(add after deployment)* |
| Backend API | *(add after deployment)* |

> Screenshots of successful deployment are in `/docs/deployment/`.

---

## Testing

### Unit Tests (Vitest + React Testing Library)

```bash
# Run all tests once
npm test -- --run

# Watch mode (development)
npm test
```

Test files are co-located with their components under `__tests__/` directories.

**Coverage areas:**
- `src/api/__tests__/appointmentApi.test.js` — API function unit tests (mocked Axios)
- `src/pages/appointments/__tests__/AppointmentsPage.test.jsx` — page render + filter + cancel flow
- `src/pages/appointments/__tests__/BookAppointmentPage.test.jsx` — 4-step wizard flow
- `src/pages/appointments/__tests__/QueueBoardPage.test.jsx` — queue list + status updates
- `src/components/common/__tests__/` — common component tests

### Test Environment

| Tool | Version |
|---|---|
| Vitest | ^4.x |
| @testing-library/react | ^16.x |
| @testing-library/user-event | ^14.x |
| jsdom | ^29.x |

Test setup file: `src/tests/setup.js` — configures `@testing-library/jest-dom` matchers.

---

## Build

```bash
# Production build
npm run build

# Preview production build locally
npm run preview
```

Output goes to `dist/`.

---

## License

[ISC](LICENSE)
