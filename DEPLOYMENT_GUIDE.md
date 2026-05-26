# 🏡 MaidConnect — Complete Deployment Guide
## From Zero to Live (APK + Admin URL + Backend)

---

## 📁 Project Structure

```
maidconnect/
├── backend/        ← Node.js + Express API
├── mobile/         ← React Native (Expo) — iOS & Android
└── admin/          ← React Web Admin Panel
```

---

## STEP 1 — Set Up Free Services (15 minutes)

### 1.1 MongoDB Atlas (Free Database)
1. Go to **https://cloud.mongodb.com**
2. Sign up → Create Free Cluster (M0 — free forever)
3. Database Access → Add user (username + password)
4. Network Access → Allow All IPs (`0.0.0.0/0`)
5. Connect → "Connect your application" → Copy connection string
6. Replace `<password>` in the string with your actual password
7. Save this: `mongodb+srv://user:pass@cluster0.xxxxx.mongodb.net/maidconnect`

### 1.2 Cloudinary (Free Image/Voice Storage)
1. Go to **https://cloudinary.com** → Sign up free
2. Dashboard → Copy: Cloud Name, API Key, API Secret
3. Settings → Upload → Enable unsigned uploads (for mobile)

### 1.3 Railway (Free Backend Hosting)
1. Go to **https://railway.app** → Sign up with GitHub
2. New Project → Deploy from GitHub repo
3. OR use CLI: `npm install -g @railway/cli && railway login`

### 1.4 Vercel (Free Admin Panel Hosting)
1. Go to **https://vercel.com** → Sign up with GitHub
2. Import your admin folder as a project

### 1.5 Expo + EAS (Free APK Builder)
```bash
npm install -g expo-cli eas-cli
eas login
```

---

## STEP 2 — Deploy the Backend

### 2.1 Create .env file
```bash
cd maidconnect/backend
cp .env.example .env
# Fill in all values from Step 1
```

### 2.2 Push to GitHub
```bash
git init
git add .
git commit -m "MaidConnect backend"
git remote add origin https://github.com/YOUR_USERNAME/maidconnect-backend.git
git push -u origin main
```

### 2.3 Deploy to Railway
```bash
cd maidconnect/backend
railway init
railway up
```
OR via Railway dashboard:
- New Project → Deploy from GitHub
- Select your backend repo
- Add environment variables (copy from .env)
- Deploy!

### 2.4 Get your Backend URL
Railway will give you: `https://maidconnect-backend-production.up.railway.app`

**Test it:**
```
GET https://your-url.railway.app/health
→ { "status": "ok" }
```

### 2.5 Create Admin User
```bash
# SSH into Railway shell or run locally:
node -e "
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();
mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const User = require('./src/models/User');
  const hash = await bcrypt.hash('Admin@123456', 12);
  await User.create({ name:'Admin', email:'admin@maidconnect.com', password:hash, role:'admin', isVerified:true });
  console.log('Admin created! Email: admin@maidconnect.com  Pass: Admin@123456');
  process.exit(0);
});
"
```

---

## STEP 3 — Deploy the Admin Panel

### 3.1 Set API URL
```bash
cd maidconnect/admin
echo "REACT_APP_API_URL=https://your-backend.railway.app/api" > .env
```

### 3.2 Deploy to Vercel
```bash
npm install -g vercel
vercel --prod
```
OR push to GitHub → import on vercel.com → auto-deploy.

### ✅ Your Admin URL will be:
```
https://maidconnect-admin.vercel.app
```

**Login credentials:**
- Email: `admin@maidconnect.com`
- Password: `Admin@123456`

---

## STEP 4 — Build the Mobile App (APK + IPA)

### 4.1 Update API URL
```bash
cd maidconnect/mobile
```
Edit `app.json` → find `extra.API_URL`:
```json
"API_URL": "https://your-backend.railway.app/api"
```

### 4.2 Install dependencies
```bash
npm install
```

### 4.3 Register with Expo EAS
```bash
eas build:configure
# This creates your EAS project ID — copy it into app.json > extra.eas.projectId
```

### 4.4 Build Android APK (FREE)
```bash
eas build -p android --profile preview
```
- Build takes ~10-15 minutes
- Download link sent to your email
- Also available at: **https://expo.dev/accounts/YOUR_NAME/builds**

### 4.5 Build iOS IPA (Needs Apple Developer Account — $99/year)
```bash
eas build -p ios --profile preview
```

### 4.6 Test APK Locally (Without Building)
```bash
npx expo start
# Scan QR code with Expo Go app on your phone
```

---

## STEP 5 — Configure Payment Gateways

### 5.1 Fawry
1. Register at **https://developer.fawrystaging.com**
2. Get Merchant Code & Security Key
3. Add to backend `.env`:
```
FAWRY_MERCHANT_CODE=your_code
FAWRY_SECURITY_KEY=your_key
```

### 5.2 Vodafone Cash
1. Contact Vodafone Business: **16888**
2. Request merchant API access
3. Get Merchant ID + Password

### 5.3 InstaPay
1. Register at **https://www.instapay.eg**
2. Business account → API credentials

### 5.4 Amazon Pay
1. Register at **https://pay.amazon.eg**
2. Merchant account → API keys

> ⚠️ **Testing mode:** Use sandbox/staging credentials first. Switch to production only after testing.

---

## STEP 6 — Post-Deployment Checklist

```
✅ Backend live at Railway
✅ Admin panel live at Vercel
✅ APK downloaded from Expo EAS
✅ MongoDB Atlas cluster active
✅ Cloudinary images working
✅ At least one payment method active
✅ Admin user created
✅ Test registration flow (maid + housewife)
✅ Test chat + voice note
✅ Test Fawry payment with test merchant
```

---

## 💰 Monthly Cost Summary (MVP Phase)

| Service      | Free Tier Limit           | Cost After Limit |
|--------------|--------------------------|-----------------|
| MongoDB Atlas| 512MB storage             | $57/mo          |
| Railway      | $5 free credit/mo         | ~$5-10/mo       |
| Vercel       | Unlimited static          | Free forever    |
| Cloudinary   | 25GB storage, 25GB/mo BW  | $89/mo          |
| Expo EAS     | 30 builds/mo              | $29/mo          |
| **Total MVP**| **~$0–10/month**          | **~$150/mo**    |

---

## 🔗 Quick Reference

```
Backend API:   https://your-app.railway.app/api
Admin Panel:   https://maidconnect-admin.vercel.app
Admin Login:   admin@maidconnect.com / Admin@123456
APK Download:  https://expo.dev/accounts/YOUR_NAME/builds
API Health:    https://your-app.railway.app/health
```

---

## 📱 Key API Endpoints

```
POST /api/auth/register          Register user
POST /api/auth/login             Login
POST /api/auth/social            Google/Apple/Facebook login
GET  /api/maids                  Browse maids
POST /api/maids/:id/like         Like a maid
POST /api/chats/start            Start a chat
POST /api/chats/message          Send message/voice note
POST /api/payments/fawry         Initiate Fawry payment
POST /api/payments/vodafone-cash Initiate Vodafone Cash
POST /api/payments/instapay      Initiate InstaPay
POST /api/payments/amazon-pay    Initiate Amazon Pay
POST /api/payments/callback      Payment webhook
GET  /api/admin/dashboard        Admin stats (admin only)
PUT  /api/admin/maids/:id/status Approve/reject maid
```

---

## 🆘 Troubleshooting

**MongoDB connection fails:**
→ Check IP whitelist in Atlas (allow `0.0.0.0/0`)
→ Check username/password in connection string

**Railway deploy fails:**
→ Check all env variables are set
→ Check Node version (should be 18+)

**EAS build fails:**
→ Run `eas build:configure` first
→ Check `app.json` has valid `bundleIdentifier`

**APK crashes on launch:**
→ Check `API_URL` in `app.json` is correct
→ Make sure backend is running

---

*Built with ❤️ — MaidConnect MVP v1.0*
