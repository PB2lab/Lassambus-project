# LASAMBUS Project Setup Guide

## Prerequisites

- Python 3.8+ 
- Node.js 16+ and npm/yarn
- MongoDB (local or MongoDB Atlas)

## Quick Start

### 1. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create virtual environment (recommended)
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create .env file (see below for template)
# Then run the server
uvicorn app.main:app --reload --port 8000
# OR use the backward-compatible entry point:
# uvicorn server:app --reload --port 8000
```

### 2. Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install
# OR
yarn install

# Create .env file (see below for template)
# Then start the development server
npm start
# OR
yarn start
```

### 3. Environment Variables

#### Backend (.env in `/backend/` directory)

```env
MONGO_URL=mongodb://localhost:27017
# OR for MongoDB Atlas:
# MONGO_URL=mongodb+srv://username:password@cluster.mongodb.net/

DB_NAME=lasambus
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
CORS_ORIGINS=http://localhost:3000
```

#### Frontend (.env in `/frontend/` directory)

```env
REACT_APP_BACKEND_URL=http://localhost:8000
```

## Running the Application

1. **Start MongoDB** (if using local MongoDB)
   ```bash
   mongod
   ```

2. **Start Backend** (Terminal 1)
   ```bash
   cd backend
   source venv/bin/activate  # if using venv
   uvicorn app.main:app --reload --port 8000
   ```
   Backend will be available at: http://localhost:8000
   API docs at: http://localhost:8000/docs

3. **Start Frontend** (Terminal 2)
   ```bash
   cd frontend
   npm start
   ```
   Frontend will open at: http://localhost:3000

## Testing the Improvements

### Security Features
1. **Password Validation**: Try registering with a weak password - you'll see real-time validation
2. **Admin Registration**: Try registering as admin without being logged in as admin - should fail
3. **Rate Limiting**: Try logging in 10+ times quickly - should see rate limit error

### New Features
1. **Pagination**: Go to Admin Dashboard and see pagination controls at the bottom
2. **Distance Calculation**: Hospitals are now sorted by accurate distance
3. **Input Validation**: Try submitting invalid data - see better error messages

## Default Test Accounts

After first run, you can register accounts:
- **Personnel Account**: Register normally (anyone can create)
- **Admin Account**: Must be created by an existing admin

## Troubleshooting

### Backend Issues
- **MongoDB Connection Error**: Make sure MongoDB is running or check your MONGO_URL
- **JWT_SECRET Error**: Make sure JWT_SECRET is set in .env file
- **Module Not Found**: Make sure you're in the backend directory and dependencies are installed

### Frontend Issues
- **API Connection Error**: Check that backend is running on port 8000 and REACT_APP_BACKEND_URL is correct
- **Build Errors**: Try deleting `node_modules` and reinstalling: `rm -rf node_modules && npm install`

## API Documentation

Once backend is running, visit:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc
