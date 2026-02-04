# Deploy LASAMBUS Online — Step-by-Step Guide

Follow these steps to deploy your app so others can use it at a live link. You’ll use **MongoDB Atlas** (database), **Render** (backend), and **Netlify** (frontend). All have free tiers.

**Before you start:** Push the latest code (including `backend/render.yaml`, `frontend/netlify.toml`, and this `DEPLOY.md`) to GitHub so Render and Netlify can use the correct config.

---

## Part 1: MongoDB Atlas (Database)

### 1.1 Create account and cluster
1. Go to **https://www.mongodb.com/cloud/atlas**
2. Click **Try Free** and create an account (or sign in).
3. Create an **Organization** and **Project** if asked (use defaults).
4. Under **Build a Database**, choose **M0 FREE** → **Create**.
5. Choose a cloud provider and region (e.g. AWS, closest to you) → **Create Cluster**.
6. Wait until the cluster is created.

### 1.2 Allow access
1. Under **Security → Network Access** → **Add IP Address**.
2. Click **Allow Access from Anywhere** (adds `0.0.0.0/0`) → **Confirm**.
3. Under **Security → Database Access** → **Add New Database User**.
4. Choose **Password**; set username and password (save the password).
5. Under **Database User Privileges** choose **Atlas admin** (or **Read and write to any database**) → **Add User**.

### 1.3 Get connection string
1. Go back to **Database** (left menu) → **Connect** on your cluster.
2. Choose **Connect your application**.
3. Copy the connection string. It looks like:
   ```text
   mongodb+srv://USERNAME:PASSWORD@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
4. Replace `<password>` with your actual database user password (keep the rest as-is).
5. **Save this string** — you’ll use it as `MONGO_URL` in Render.

---

## Part 2: Render (Backend API)

### 2.1 Create account and connect GitHub
1. Go to **https://render.com**
2. Sign up with **GitHub** and authorize Render.
3. In the dashboard, click **New +** → **Web Service**.

### 2.2 Connect your repo
1. Connect **GitHub** if not already connected.
2. Find and select **PB2lab/Lassambus-project** (or your repo name).
3. Click **Connect**.

### 2.3 Configure the backend service
Use these settings:

| Field | Value |
|-------|--------|
| **Name** | `lasambus-api` (or any name) |
| **Region** | Choose closest to you |
| **Root Directory** | `backend` |
| **Runtime** | `Python 3` |
| **Build Command** | `pip install -r requirements.txt` |
| **Start Command** | `uvicorn app.main:app --host 0.0.0.0 --port $PORT` |

### 2.4 Environment variables
In **Environment**, add:

| Key | Value |
|-----|--------|
| `MONGO_URL` | Your MongoDB Atlas connection string from Part 1 |
| `DB_NAME` | `lasambus` |
| `JWT_SECRET` | A long random string (e.g. generate at https://randomkeygen.com/) |
| `CORS_ORIGINS` | Leave empty for now; we’ll set it after Netlify (e.g. `https://your-app.netlify.app`) |

Click **Create Web Service**. Render will build and deploy. Wait until the service is **Live**.

### 2.5 Get backend URL
From the service page, copy the URL, e.g.:
```text
https://lasambus-api.onrender.com
```
**Save it** — you’ll use it for Netlify and for `CORS_ORIGINS`.

### 2.6 Update CORS (after you have the frontend URL)
Once Netlify is done (Part 3), go back to Render → your service → **Environment** → edit `CORS_ORIGINS` and set it to your Netlify URL, e.g.:
```text
https://your-app-name.netlify.app
```
Then **Save Changes** (Render will redeploy).

---

## Part 3: Netlify (Frontend)

### 3.1 Create account and connect GitHub
1. Go to **https://www.netlify.com**
2. Sign up / log in with **GitHub**.
3. Click **Add new site** → **Import an existing project** → **GitHub**.

### 3.2 Select repo and branch
1. Choose **PB2lab/Lassambus-project** (or your repo).
2. Branch: **main** (or your default branch).
3. Click **Next**.

### 3.3 Build settings
Use:

| Field | Value |
|-------|--------|
| **Base directory** | `frontend` |
| **Build command** | `npm run build` |
| **Publish directory** | `frontend/build` |

(If Publish directory is pre-filled as `build`, change it to `frontend/build`.)

### 3.4 Environment variable
Under **Environment variables** → **Add a variable**:

| Key | Value |
|-----|--------|
| `REACT_APP_BACKEND_URL` | Your Render backend URL (e.g. `https://lasambus-api.onrender.com`) |

No quotes needed. Save.

### 3.5 Deploy
Click **Deploy site**. Wait until the deploy finishes (status: **Published**).

### 3.6 Get frontend URL
Netlify will show a URL like:
```text
https://random-name-12345.netlify.app
```
You can change it: **Site settings** → **Domain management** → **Options** → **Edit site name** → e.g. `lasambus-portal` → **Save**.  
Your site will be: `https://lasambus-portal.netlify.app`.

### 3.7 Set CORS on backend
Go back to **Render** → your backend service → **Environment** → set:
```text
CORS_ORIGINS = https://lasambus-portal.netlify.app
```
(Use your real Netlify URL.) Save so the backend allows requests from your frontend.

---

## Part 4: Test and Share

1. Open your **Netlify URL** in the browser.
2. Register a new user (e.g. personnel).
3. Log in and try creating an incident and opening the admin view (after creating an admin user if needed).
4. Share the **Netlify link** with the third party so they can use the app themselves.

---

## Troubleshooting

| Issue | What to do |
|--------|------------|
| Frontend can’t reach backend | Check `REACT_APP_BACKEND_URL` on Netlify and `CORS_ORIGINS` on Render (must match Netlify URL). |
| “Invalid credentials” / DB errors | Check `MONGO_URL` and `DB_NAME` on Render; ensure MongoDB user has read/write and IP is allowed. |
| Build fails on Render | Ensure **Root Directory** is `backend` and **Start Command** uses `$PORT`. |
| Build fails on Netlify | Ensure **Base directory** is `frontend`, **Publish directory** is `frontend/build`. |
| Backend sleeps on free tier | Render free services spin down after inactivity; first request may take 30–60 seconds. |

---

## Summary

1. **MongoDB Atlas**: Create cluster, user, get connection string → use as `MONGO_URL`.
2. **Render**: Connect GitHub, create Web Service from `backend`, set env vars, copy backend URL.
3. **Netlify**: Connect GitHub, build from `frontend`, set `REACT_APP_BACKEND_URL` to backend URL, copy frontend URL.
4. **Render**: Set `CORS_ORIGINS` to your Netlify URL.
5. Share the **Netlify URL** so others can use the app.

Your live app link will be: **https://your-site-name.netlify.app**
