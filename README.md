# VaxTrack Frontend

A React-based frontend for **VaxTrack** — a national vaccination tracking and management system for Sri Lanka. Built with React 19, Vite 7, and Tailwind CSS v4.

## 🔗 Live URLs

| Service                | URL                                              |
| ---------------------- | ------------------------------------------------ |
| **Frontend**           | <https://vaxtrackweb.netlify.app>                |
| **Backend API**        | <https://vaxtrack-backend.onrender.com>          |
| **API Docs (Swagger)** | <https://vaxtrack-backend.onrender.com/api-docs> |

---

## Tech Stack

| Layer            | Technology                               |
| ---------------- | ---------------------------------------- |
| Framework        | React 19 (functional components + hooks) |
| Build Tool       | Vite 7                                   |
| Styling          | Tailwind CSS v4                          |
| State Management | Zustand                                  |
| Routing          | React Router DOM v7                      |
| Forms            | React Hook Form                          |
| HTTP Client      | Axios                                    |
| Notifications    | React Hot Toast                          |
| Testing          | Vitest + React Testing Library           |

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
- VaxTrack backend running (see [backend README](https://github.com/MiniduTH/vaxtrack-backend/edit/dev/README.md))

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

| Variable       | Description                          |
| -------------- | ------------------------------------ |
| `VITE_API_URL` | Base URL of the VaxTrack backend API |

### Running Locally

```bash
npm run dev
```

The app starts at `http://localhost:5173`.

---

## User Roles & Features

| Role                 | Navigation                                                                                                    |
| -------------------- | ------------------------------------------------------------------------------------------------------------- |
| **Public (Patient)** | Dashboard, My Appointments, Book Appointment, Find Hospital, My Records, My Dependents, Side Effects, Profile |
| **HospitalStaff**    | Dashboard, Queue Board, Clinics, Batches, All Records, Side Effects                                           |
| **Admin**            | All of the above + Hospitals, Vaccines, Inventory Alerts                                                      |

### Key Features

- **4-step appointment booking wizard** — choose clinic → select patient → confirm → success + QR code
- **Queue management board** — staff can mark patients as Completed or No-Show in real time
- **Role-based sidebar** — navigation adapts automatically based on logged-in user role
- **JWT session persistence** — auth token stored via Zustand + localStorage, survives page refresh
- **Protected routes** — unauthenticated users are redirected to `/login` with return-URL state

---

## API Integration

All API calls go through `src/api/` modules. Each module wraps Axios and maps to a backend resource:

| Module              | Endpoints Used                                                       |
| ------------------- | -------------------------------------------------------------------- |
| `authApi.js`        | POST `/users/login`, POST `/users/register`                          |
| `appointmentApi.js` | CRUD `/appointments`, `/appointments/my`, `/appointments/clinic/:id` |
| `clinicApi.js`      | GET `/clinics`, POST/PUT `/clinics`                                  |
| `hospitalApi.js`    | GET/POST `/hospitals`                                                |
| `dependentApi.js`   | CRUD `/users/dependents`                                             |
| `recordApi.js`      | GET `/records/history`, `/records/due`                               |
| `vaccineApi.js`     | CRUD `/vaccines`                                                     |
| `sideEffectApi.js`  | CRUD `/side-effects`                                                 |

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
   VITE_API_URL = https://vaxtrack-backend.onrender.com/api
   ```

6. Click **Deploy**

### Deployment Report

| Item                | Details                                     |
| ------------------- | ------------------------------------------- |
| **Platform**        | Netlify                                     |
| **Plan**            | Free tier                                   |
| **Deploy trigger**  | Auto-deploy on push to `main`               |
| **Build command**   | `npm run build`                             |
| **Publish dir**     | `dist`                                      |
| **Frontend URL**    | <https://vaxtrackweb.netlify.app>           |
| **Backend API URL** | <https://vaxtrack-backend.onrender.com>     |
| **VITE_API_URL**    | `https://vaxtrack-backend.onrender.com/api` |

---

## Testing

### Testing Environment Configuration

| Tool                        | Version |
| --------------------------- | ------- |
| Vitest                      | ^4.x    |
| @testing-library/react      | ^16.x   |
| @testing-library/user-event | ^14.x   |
| jsdom                       | ^29.x   |

Test setup file: `src/tests/setup.js` — configures `@testing-library/jest-dom` matchers.

Environment variable used by tests:

```env
VITE_API_URL=http://localhost:5000/api
```

Vitest reads `.env` automatically during test runs.

---

### Unit Tests (Vitest + React Testing Library)

```bash
# Run all tests once
npm test -- --run

# Watch mode (re-runs on file changes)
npm test

# With Vitest UI (browser-based test explorer)
npm run test:ui
```

**Coverage areas:**

| File                                                            | What it Tests                                 |
| --------------------------------------------------------------- | --------------------------------------------- |
| `src/api/__tests__/appointmentApi.test.js`                      | API function unit tests (Axios mocked)        |
| `src/pages/appointments/__tests__/AppointmentsPage.test.jsx`    | Page render, filter, cancel flow              |
| `src/pages/appointments/__tests__/BookAppointmentPage.test.jsx` | 4-step booking wizard flow                    |
| `src/pages/appointments/__tests__/QueueBoardPage.test.jsx`      | Queue list and real-time status updates       |
| `src/components/common/__tests__/`                              | Common component render and interaction tests |

---

### Integration Testing Setup and Execution

Frontend integration tests render full page components with a mocked Axios layer, verifying that UI state, routing, and API calls work together without a real backend.

1. **Axios is mocked** via `vi.mock` — no real HTTP requests are made.
2. **React Router is wrapped** around components so `<Link>` and `useNavigate` work correctly.
3. **Zustand store** is reset between tests to prevent state bleed.

```bash
# Run all tests (unit + integration)
npm test -- --run

# Run a specific test file
npx vitest run src/pages/appointments/__tests__/AppointmentsPage.test.jsx

# Run tests matching a name pattern
npx vitest run --reporter=verbose -t "cancel"
```

---

### Performance Testing

Frontend performance is measured with **Lighthouse**:

```bash
# Install Lighthouse CLI (one-time)
npm install -g lighthouse

# Build and preview production bundle
npm run build
npm run preview        # http://localhost:4173

# Run Lighthouse
lighthouse http://localhost:4173 --output html --output-path ./lighthouse-report.html
```

Key targets:

- **First Contentful Paint (FCP)** < 1.8 s
- **Time to Interactive (TTI)** < 3.8 s
- **Largest Contentful Paint (LCP)** < 2.5 s
- **Cumulative Layout Shift (CLS)** < 0.1

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
