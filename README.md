# 🩺 Doctor Tracker

A secure, full-stack admin portal for managing **doctors** and their **patients**, with
fast search / filtering, clean CRUD workflows, and an analytics dashboard. Built as two
independent applications — a **Next.js** client and a standalone **Express + MongoDB**
REST API.

## 🔗 Live Demo

| | URL |
| --- | --- |
| **App (Vercel)** | https://doctor-tracker-opal-tau.vercel.app |
| **API (Render)** | https://doctor-tracker-api-apfe.onrender.com/api/health |

**Demo login:** `admin@doctortracker.com` · `Admin@12345`

> ⏳ The API runs on Render's free tier, which sleeps after ~15 min idle — the **first
> request can take ~30–50s** to cold-start. If login seems to hang, give it a moment and retry.

---

## 1. Description (Elevator Pitch)

Clinics and hospital administrators need a single, trustworthy place to keep track of who
their doctors are and which patients each one is treating — without wading through
spreadsheets. **Doctor Tracker** is that place: an authenticated admin portal where you can
create and manage doctors, drill into any doctor to add or remove their patients, manage a
global patient roster, and watch it all come together on a live analytics dashboard
(totals, patients-per-doctor, condition/status breakdowns, and 6-month registration
trends). It is engineered for performance — every list is paginated, searchable and
filterable against **indexed** MongoDB queries — and for a clean, responsive experience on
both desktop and mobile.

---

## 2. Tech Stack

| Layer            | Technology |
| ---------------- | ---------- |
| **Client**       | Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4 |
| **Server state** | TanStack Query (React Query) v5 |
| **Forms**        | React Hook Form + Zod |
| **Charts**       | Recharts |
| **Icons / Toast**| lucide-react, Sonner |
| **API**          | Node.js, Express, TypeScript (RESTful) |
| **Database**     | MongoDB + Mongoose (indexed) |
| **Auth**         | JWT — httpOnly cookie (primary) + `Authorization: Bearer` fallback, bcrypt hashing |
| **Validation**   | Zod (shared shape on client & server) |
| **Hosting**      | Vercel (client) · Render (API) · MongoDB Atlas (database) |

---

## 3. Features

**Authentication**
- Secure email/password login; passwords hashed with bcrypt.
- JWT issued in an **httpOnly** cookie, with a **Bearer-token fallback** for browsers that
  block cross-site cookies. Every protected API route is guarded server-side.
- Login rate-limiting; client-side route guard for UX redirects.

**Doctor Management**
- Create / edit / delete doctors (name, specialization, hospital, phone, email).
- List with **search** (name / specialization / hospital), **filters** (specialization,
  hospital, created-date range), **sort** and **pagination**.
- Drill into a doctor to **view, add and remove** their patients.
- Deleting a doctor cascades to their patient records.

**Patient Management**
- Dedicated patients page: list **all** patients, create / edit / delete.
- **Search** (name / condition), **filters** (status, condition, date range), sort, pagination.
- Each patient is linked to a doctor (shown and editable).

**Dashboard & Data Visualization**
- KPIs: total doctors, total patients, avg. patients per doctor, new patients this month.
- Charts: 6-month registration trend (area), patients by status (donut), top doctors by
  patient count (bar), patients by condition (donut), patients by specialization (bar).
- All metrics are computed with **server-side aggregation pipelines** in a single request.

**UX**
- Responsive layout (collapsible sidebar → mobile drawer), skeleton loaders, empty states,
  cache-driven updates, toasts, and accessible focus states.

---

## 4. Setup Guide (Local)

### Prerequisites
- **Node.js ≥ 20.9**
- **MongoDB** — via Docker *(recommended)* **or** the built-in no-Docker fallback (below)

### 1) Configure environment
```bash
cp server/.env.example server/.env
cp client/.env.example client/.env.local
```

`server/.env.example`:
```env
PORT=4000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/doctor_tracker
JWT_SECRET=change_me_to_a_long_random_secret
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:3000
ADMIN_NAME=Admin User
ADMIN_EMAIL=admin@doctortracker.com
ADMIN_PASSWORD=Admin@12345
```

`client/.env.example`:
```env
NEXT_PUBLIC_API_URL=http://localhost:4000/api
```

### 2) Install
```bash
npm run install:all
```

### 3) Start MongoDB
```bash
npm run db:up      # Docker (docker compose up -d), MongoDB 7 on :27017
# — or, without Docker —
npm run db:local   # persistent local MongoDB on :27017 (data in server/.mongo-data)
```

### 4) Seed & run
```bash
npm run seed       # admin account + sample doctors/patients (spread over 6 months)
npm run dev        # API :4000 + client :3000
```
Open **http://localhost:3000** and sign in with the demo credentials above.

### Scripts (root `package.json`)
| Script | What it does |
| ------ | ------------ |
| `npm run install:all` | Install client + server deps |
| `npm run db:up` / `db:down` | Start / stop the Docker MongoDB |
| `npm run db:local` | Start a no-Docker MongoDB |
| `npm run seed` | Seed the database |
| `npm run dev` | Run API + client concurrently |
| `npm run build` | Production build of both apps |

---

## 5. System Architecture

Two independently deployable apps communicate over a REST boundary:

```
┌───────────────────────────┐        HTTP (REST, JSON)        ┌───────────────────────────┐
│   Next.js Client (Vercel)  │   ───────────────────────────► │  Express REST API (Render) │
│                            │   ◄─────────────────────────── │                            │
│  • Pages: dashboard /      │   httpOnly cookie  OR           │  routes → middleware →     │
│    doctors / patients /    │   Authorization: Bearer <jwt>   │  controllers → Mongoose    │
│    login                   │                                 │                            │
│  • TanStack Query cache    │                                 │  • authenticate (JWT)      │
│  • Axios (withCredentials  │                                 │  • validate (Zod)          │
│    + Bearer interceptor)   │                                 │  • central error handler   │
│  • React Hook Form + Zod   │                                 │                            │
│  • Recharts visualizations │                                 └─────────────┬─────────────┘
└───────────────────────────┘                                               │ Mongoose (pooled)
                                                                            ▼
                                                                 ┌────────────────────┐
                                                                 │  MongoDB (Atlas)    │
                                                                 │ users / doctors /   │
                                                                 │ patients (indexed)  │
                                                                 └────────────────────┘
```

**Request flow (`GET /api/doctors?search=...&page=2`)**
1. Client builds a cleaned query object and calls the API (cookie + Bearer attached).
2. Express runs `authenticate` (verifies JWT) → `validate` (Zod coerces/validates query) →
   the doctor controller.
3. The controller builds a Mongo filter (text search + filters + date range), runs the page
   query and the count **in parallel** (`.lean()`), attaches per-page patient counts via an
   aggregation, and returns `{ data, meta }`.
4. TanStack Query caches the result by a structured key and keeps the previous page visible
   while the next loads.

**Folder structure**
```
Doctor Tracker/
├── server/                     # Express REST API (TypeScript)
│   └── src/
│       ├── config/             # env validation, Mongo connection
│       ├── models/             # Mongoose schemas + indexes (User/Doctor/Patient)
│       ├── validators/         # Zod schemas (body/query/params)
│       ├── middleware/         # auth, validate, error handling
│       ├── controllers/        # business logic (doctors/patients/dashboard/auth)
│       ├── routes/             # Express routers
│       ├── utils/              # ApiError, asyncHandler, token, pagination, query helpers
│       └── seed/               # database seeder
├── client/                     # Next.js app (TypeScript)
│   └── src/
│       ├── app/                # routes: login, (protected)/{dashboard,doctors,patients}
│       ├── components/         # ui/, layout/, charts/, doctors/, patients/, providers/
│       ├── hooks/              # React Query hooks + useDebounce
│       └── lib/                # api client, auth-token, types, schemas, query keys, utils
├── render.yaml                 # Render blueprint for the API
├── docker-compose.yml          # MongoDB 7 (local)
└── README.md
```

### API Reference
All routes are prefixed with `/api`. Everything except `POST /auth/login` requires auth.

| Method | Endpoint | Description |
| ------ | -------- | ----------- |
| POST   | `/auth/login` | Log in, set httpOnly cookie, return `{ user, token }` |
| POST   | `/auth/logout` | Clear the auth cookie |
| GET    | `/auth/me` | Current user |
| GET    | `/doctors` | List (search, filters, sort, pagination) |
| POST   | `/doctors` | Create a doctor |
| GET    | `/doctors/:id` | Get a doctor (+ patient count) |
| PATCH  | `/doctors/:id` | Update a doctor |
| DELETE | `/doctors/:id` | Delete a doctor (+ cascade patients) |
| GET    | `/doctors/:id/patients` | List a doctor's patients |
| POST   | `/doctors/:id/patients` | Add a patient under a doctor |
| GET    | `/doctors/meta/options` | Distinct specializations/hospitals (filters) |
| GET    | `/doctors/meta/list` | Lightweight `{_id, name, specialization}` list for selects |
| GET    | `/patients` | List (search, filters, sort, pagination) |
| POST   | `/patients` | Create a patient |
| GET/PATCH/DELETE | `/patients/:id` | Get / update / delete a patient |
| GET    | `/patients/meta/options` | Distinct conditions (filters) |
| GET    | `/dashboard/stats` | Aggregated analytics |

---

## 6. Technical Decisions (Deep Dive)

### Decision 1 — TanStack Query for server state, not Redux/Context
Almost all state here is *server state*: lists of doctors/patients, dashboard metrics, the
current user — asynchronous, shared across pages, and needing to stay consistent after every
mutation. Redux would mean hand-writing thunks, loading flags and cache invalidation for
every resource (largely re-implementing a cache); a single global Context re-renders every
consumer on any change. TanStack Query instead gives us request **deduplication** and
**caching** (keyed by `['doctors','list',params]`), `staleTime` to avoid redundant refetches,
**`keepPreviousData`** so paginated tables don't flash empty, declarative loading/error
states, and targeted **invalidation** (creating a patient invalidates the patient list, the
doctor list, *and* the dashboard in one place). Components re-render only for the queries they
subscribe to — directly satisfying the "avoid unnecessary re-renders" requirement. Local UI
state (modals, filter inputs) stays in `useState`.

### Decision 2 — Separate Express backend with JWT: httpOnly cookie + Bearer fallback
With a standalone API, the browser talks cross-origin (Vercel → Render), so the session
transport matters. We issue the JWT in an **httpOnly, `SameSite=None; Secure` cookie** — not
readable by JavaScript (removes the main XSS token-theft vector) and sent automatically
(`withCredentials` + `cors({ credentials: true })`). Because some browsers (Safari/Firefox)
block cross-site cookies by default, the login response **also returns the token**, which the
client stores and attaches as `Authorization: Bearer` via an axios interceptor — so auth works
in every browser. Either way the **real security boundary is server-side**: every protected
route runs the `authenticate` middleware (cookie first, Bearer fallback) and rejects
missing/invalid tokens (verified: `GET /doctors` → `401` without credentials). The client
`AuthGuard` is purely a UX redirect, never the security mechanism. *Trade-off:* the fallback
token lives in `localStorage` (JS-readable) — the accepted cost of cross-site auth everywhere.

### Bonus — Query optimization & indexing
- **Indexes matched to access patterns:** text indexes for search
  (`doctor{name,specialization,hospital}`, `patient{name,condition}`), single-field indexes
  for filter dropdowns, a `createdAt` index for date-range + default sort, and a compound
  `{doctor, createdAt}` index so a doctor's patients come back pre-sorted.
- **Lean reads** (`.lean()`) for list endpoints; **parallelism** (page query + count +
  aggregations via `Promise.all`); **dashboard** uses `$group`/`$lookup` pipelines so counting
  happens in the DB, not in Node.
- **Client:** debounced search (400 ms), `keepPreviousData` pagination, memoized derived data,
  and a dedicated lightweight `/doctors/meta/list` endpoint for selects.

---

## 7. Deployment

Hosted as two services + a managed database:

| Piece | Host | Why |
| ----- | ---- | --- |
| Database | **MongoDB Atlas** (free M0) | Managed, reachable from the cloud |
| Backend API | **Render** (Web Service, free) | Runs a long-lived Express server — no serverless refactor |
| Frontend | **Vercel** | First-class Next.js hosting |

> A standalone Express app fits Render's always-on model far better than Vercel's serverless
> functions, which is why the API goes to Render and only the Next.js client goes to Vercel.

**Backend (Render)** — *New + → Blueprint* → pick this repo (it contains [`render.yaml`](render.yaml)) → set:
- `MONGODB_URI` = your Atlas URI (include the `/doctor_tracker` database name)
- `CLIENT_URL` = your Vercel URL (comma-separate to also allow `http://localhost:3000`)
- `ADMIN_EMAIL` / `ADMIN_PASSWORD` = **strong production credentials** (optional if the DB is
  already seeded). `JWT_SECRET` is auto-generated; `PORT` is provided by Render.
- Health check: `/api/health`.

**Seed Atlas once** — point the seeder at the Atlas URI and run `npm run seed` (locally or
from Render's Shell). Re-running **resets** the data.

**Frontend (Vercel)** — *Add New → Project* → import the repo → **Root Directory** = `client`
→ set `NEXT_PUBLIC_API_URL = https://<your-render-app>.onrender.com/api` → deploy.

**Wire them** — set Render's `CLIENT_URL` to your Vercel origin and redeploy so CORS accepts
the frontend. (The server tolerates a trailing slash on `CLIENT_URL`.)

---

## 8. Visual Evidence

### Desktop
| Dashboard | Doctors |
| --------- | ------- |
| ![Dashboard](docs/screenshots/dashboard.png) | ![Doctors](docs/screenshots/doctors.png) |

| Doctor detail (patients) | Patients |
| ------------------------ | -------- |
| ![Doctor detail](docs/screenshots/doctor-detail.png) | ![Patients](docs/screenshots/patients.png) |

| Login | Add patient (form) |
| ----- | ------------------ |
| ![Login](docs/screenshots/login.png) | ![Add patient](docs/screenshots/patient-form.png) |

### Mobile
| Dashboard | Doctors | Menu |
| --------- | ------- | ---- |
| ![Mobile dashboard](docs/screenshots/mobile-dashboard.png) | ![Mobile doctors](docs/screenshots/mobile-doctors.png) | ![Mobile menu](docs/screenshots/mobile-menu.png) |

---

## 9. Evaluation Notes

- **Code structure:** clear separation (config / models / validators / middleware /
  controllers / routes) on the server; `ui` / `layout` / `charts` / feature folders +
  reusable hooks on the client.
- **Scalability:** stateless API (JWT) scales horizontally; indexes + pagination keep queries
  bounded; filter-option/select endpoints avoid loading whole collections; the REST contract
  lets the client and API scale and deploy independently.
