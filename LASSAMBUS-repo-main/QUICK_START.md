# 🚀 Quick Start Guide - Preview the Improved LASAMBUS Project

## Step-by-Step Instructions

### Step 1: Set Up Backend Environment Variables

```bash
cd backend
cp .env.example .env
```

Then edit `.env` and set:
- `MONGO_URL` - Your MongoDB connection string (use `mongodb://localhost:27017` for local MongoDB)
- `DB_NAME` - Database name (default: `lasambus`)
- `JWT_SECRET` - A secret key (any random string, e.g., `my-secret-key-12345`)
- `CORS_ORIGINS` - Frontend URL (default: `http://localhost:3000`)

### Step 2: Install Backend Dependencies

```bash
cd backend

# Create virtual environment (recommended)
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

### Step 3: Set Up Frontend Environment Variables

```bash
cd ../frontend
cp .env.example .env
```

The `.env` file should have:
```
REACT_APP_BACKEND_URL=http://localhost:8000
```

### Step 4: Install Frontend Dependencies

```bash
cd frontend
npm install
# OR
yarn install
```

### Step 5: Start MongoDB

**Option A: Local MongoDB**
```bash
# Make sure MongoDB is installed and running
mongod
```

**Option B: MongoDB Atlas (Cloud)**
- Sign up at https://www.mongodb.com/cloud/atlas
- Create a free cluster
- Get connection string and update `MONGO_URL` in backend/.env

### Step 6: Start the Backend Server

```bash
cd backend
source venv/bin/activate  # if using venv
uvicorn app.main:app --reload --port 8000
```

You should see:
```
INFO:     Uvicorn running on http://127.0.0.1:8000
INFO:     Application startup complete.
```

✅ Backend is running! Visit http://localhost:8000/docs to see API documentation.

### Step 7: Start the Frontend (in a new terminal)

```bash
cd frontend
npm start
```

The browser should automatically open to http://localhost:3000

## 🎉 You're Ready!

### What to Try:

1. **Register a Personnel Account**
   - Go to Register tab
   - Try a weak password - see real-time validation
   - Try a strong password - see green checkmarks

2. **Login**
   - Use your registered credentials
   - Try logging in multiple times quickly - see rate limiting

3. **Create an Incident Report**
   - Fill out the incident form
   - Notice the improved validation

4. **Admin Dashboard**
   - Register as admin (requires admin account first)
   - See pagination controls at the bottom
   - Try filtering incidents

5. **API Documentation**
   - Visit http://localhost:8000/docs
   - See all available endpoints
   - Test endpoints directly

## 🔍 Key Improvements to Notice:

✅ **Password Strength Indicator** - Real-time feedback during registration
✅ **Pagination Controls** - Navigate through incidents in Admin Dashboard  
✅ **Better Error Messages** - Clear validation feedback
✅ **Rate Limiting** - Try rapid login attempts
✅ **Improved Distance Calculation** - Hospitals sorted by accurate distance
✅ **Centralized API** - Cleaner code structure

## 🐛 Troubleshooting

**Backend won't start:**
- Check MongoDB is running
- Verify `.env` file exists and has all required variables
- Check Python version: `python3 --version` (needs 3.8+)

**Frontend won't connect:**
- Verify backend is running on port 8000
- Check `REACT_APP_BACKEND_URL` in frontend/.env
- Check browser console for errors

**Module not found errors:**
- Make sure you activated virtual environment
- Reinstall dependencies: `pip install -r requirements.txt`

## 📚 Need Help?

- Backend API Docs: http://localhost:8000/docs
- Check SETUP.md for detailed instructions
- Check backend logs for error messages
