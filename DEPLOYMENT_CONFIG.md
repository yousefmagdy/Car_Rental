# 🚀 Deployment Configuration Guide

## Environment Variables Setup

### 📱 Frontend (Vercel)

Create these environment variables in your Vercel project settings:

```env
REACT_APP_API_URL=https://car-rental-6uln.onrender.com/api
```

**Important Notes:**
- ✅ Remove the `@` symbol from your URL (you had `@https://...`)
- ✅ Add `/api` at the end since all backend routes use `/api` prefix
- ✅ No trailing slash

### 🖥️ Backend (Render)

Create these environment variables in your Render service settings:

```env
# Database
MONGODB_URI=your_mongodb_connection_string

# Server Configuration
PORT=5000
NODE_ENV=production

# Frontend URL (for CORS)
FRONTEND_URL=https://your-app.vercel.app
```

**Replace `your-app.vercel.app` with your actual Vercel deployment URL**

---

## 📝 Code Changes Made

### ✅ 1. Frontend API Configuration (`client/src/services/api.ts`)

**Before:**
```typescript
const API_BASE_URL = '/api';
```

**After:**
```typescript
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
```

This allows the frontend to connect to your Render backend in production while still working locally in development.

---

### ✅ 2. Backend CORS Configuration (`server/index.js`)

**Before:**
```javascript
app.use(cors());
```

**After:**
```javascript
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));
```

This allows your Vercel frontend to make requests to your Render backend.

---

### ✅ 3. Environment Validation (`server/config/validateEnv.js`)

Added `FRONTEND_URL` to required environment variables to ensure it's set in production.

---

## 🔧 Deployment Steps

### 1. **Update Environment Variables**

#### Vercel (Frontend):
1. Go to your project settings
2. Navigate to "Environment Variables"
3. Add:
   ```
   REACT_APP_API_URL = https://car-rental-6uln.onrender.com/api
   ```
4. Redeploy

#### Render (Backend):
1. Go to your service dashboard
2. Navigate to "Environment"
3. Add all variables:
   ```
   MONGODB_URI = mongodb+srv://...
   PORT = 5000
   NODE_ENV = production
   FRONTEND_URL = https://your-app.vercel.app
   ```
4. Save (auto-redeploys)

---

### 2. **Push Updated Code**

```bash
# Commit the changes
git add .
git commit -m "Configure for production deployment (Vercel + Render)"

# Push to GitHub (triggers Vercel deployment)
git push origin main

# Push to GitLab
git push gitlab main
```

---

### 3. **Verify Deployment**

#### Test Backend Health:
```bash
curl https://car-rental-6uln.onrender.com/api/health
```

Expected response:
```json
{
  "status": "OK",
  "message": "Server is running"
}
```

#### Test CORS:
Open your Vercel app and check browser console for CORS errors. Should have none!

---

## 🐛 Troubleshooting

### Issue: CORS Error on Vercel
**Solution:** Make sure `FRONTEND_URL` in Render matches your exact Vercel URL (including `https://`)

### Issue: API calls return 404
**Solution:** Ensure `REACT_APP_API_URL` ends with `/api` (not just the domain)

### Issue: Backend won't start on Render
**Solution:** Check all 4 environment variables are set correctly

### Issue: "Missing required environment variables"
**Solution:** 
1. Check Render environment variables are saved
2. Manually redeploy on Render if needed
3. Check for typos in variable names

---

## 📋 Quick Reference

### Complete Environment Variables

**Vercel (.env.production):**
```env
REACT_APP_API_URL=https://car-rental-6uln.onrender.com/api
```

**Render (.env):**
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/car_rental?retryWrites=true&w=majority
PORT=5000
NODE_ENV=production
FRONTEND_URL=https://your-vercel-app.vercel.app
```

**Local Development (.env):**
```env
# Backend
MONGODB_URI=mongodb://localhost:27017/car_rental
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# Frontend (in client folder)
REACT_APP_API_URL=http://localhost:5000/api
```

---

## ✅ Deployment Checklist

- [ ] Frontend deployed to Vercel
- [ ] Backend deployed to Render
- [ ] MongoDB Atlas database created (or accessible)
- [ ] `REACT_APP_API_URL` set in Vercel (with `/api` suffix)
- [ ] All 4 environment variables set in Render
- [ ] Code changes committed and pushed
- [ ] Both deployments redeployed with new code
- [ ] Health check endpoint works
- [ ] CORS working (no errors in browser console)
- [ ] Can create/read/update/delete data from frontend

---

## 🎉 Success!

Once all steps are complete, your Car Rental Management System will be fully deployed and accessible:

- **Frontend:** https://your-app.vercel.app
- **Backend:** https://car-rental-6uln.onrender.com
- **API:** https://car-rental-6uln.onrender.com/api

**Features Working:**
- ✅ All CRUD operations
- ✅ Input sanitization
- ✅ Rate limiting
- ✅ Server-side validation
- ✅ Double-booking prevention
- ✅ Error handling

---

**Need Help?** Check the logs:
- Vercel: Project → Deployments → Click deployment → View logs
- Render: Dashboard → Logs tab

