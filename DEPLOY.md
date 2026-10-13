# Deploying Nisha's Birthday Website on Render (free tier, no card required)

The project has two parts that deploy as two separate Render services:

- `backend/` → FastAPI **Web Service**
- `frontend/` → React **Static Site**

Push this whole folder to a GitHub repo first (e.g. `nisha-birthday`), then follow
the steps below. **Deploy the backend first**, because the frontend needs the
backend's URL at build time.

---

## 1. Backend — FastAPI Web Service

1. Render dashboard → **New +** → **Web Service** → connect your GitHub repo.
2. Settings:
   - **Name:** `nisha-birthday-api` (or anything you like)
   - **Region:** Singapore (closest to India)
   - **Branch:** `main`
   - **Root Directory:** `backend`
   - **Runtime:** Python 3
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `uvicorn app:app --host 0.0.0.0 --port $PORT`
   - **Instance Type:** Free
3. Environment variables (**Environment** tab → Add):
   - `MONGO_URI` = your MongoDB Atlas connection string
     (Atlas → Database → Connect → Drivers → Python → copy the string;
     replace `<password>` with your database user password)
   - `MONGO_DB` = `nisha_birthday`
4. Click **Create Web Service** and wait for it to go live.
5. Note the service URL, e.g. `https://nisha-birthday-api.onrender.com`.
   Open `https://nisha-birthday-api.onrender.com/api/health` — you should see
   `{"ok": true}`.

> Free-tier note: the backend sleeps after ~15 minutes of inactivity and takes
> ~30–60 seconds to wake on the first visit. That's normal on the free plan.

---

## 2. Frontend — React Static Site

**Important:** set `VITE_API_URL` *before* the first deploy, because Vite bakes
it into the built JavaScript at build time.

1. Render dashboard → **New +** → **Static Site** → connect the same GitHub repo.
2. Settings:
   - **Name:** `nisha-birthday` (or anything you like)
   - **Branch:** `main`
   - **Root Directory:** `frontend`
   - **Build Command:** `npm install && npm run build`
   - **Publish Directory:** `dist`
3. Environment variables (**Environment** tab → Add) — add this **before**
   deploying:
   - `VITE_API_URL` = your backend URL from step 1,
     e.g. `https://nisha-birthday-api.onrender.com` (no trailing slash)
4. Click **Create Static Site**. Render builds and publishes it; you'll get a URL
   like `https://nisha-birthday.onrender.com`.

Open the site: you should see "Happy Birthday Nisha", the countdown, the letter,
and the wish wall. Submit a test wish — it should appear instantly (it's saved
in MongoDB).

---

## 3. Local development (optional)

Backend:

```bash
cd backend
pip install -r requirements.txt
cp .env.example .env   # then fill in MONGO_URI
uvicorn app:app --reload --port 8000
```

Frontend (in another terminal):

```bash
cd frontend
npm install
npm run dev
```

The frontend talks to `http://localhost:8000` by default when `VITE_API_URL`
is not set.

---

## Costs

Everything above uses Render's **free tier** and MongoDB Atlas's **free (M0)**
tier. No credit card is required for either.
