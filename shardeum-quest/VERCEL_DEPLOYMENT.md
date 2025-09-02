# 🚀 Vercel Deployment Guide - ShardeumQuest

Complete guide to deploy both frontend and backend on Vercel.

## 📋 Prerequisites

- GitHub account
- Vercel account (free tier works)
- MongoDB Atlas account
- Your project pushed to GitHub

## 🛠️ Step-by-Step Deployment

### **1. Prepare Your Repository**

Make sure your project structure looks like this:
```
shardeum-quest/
├── package.json (root)
├── vercel.json
├── .env.vercel (template)
├── backend/
│   ├── api/
│   │   └── index.js (serverless entry point)
│   ├── src/
│   │   ├── server.js (original server)
│   │   ├── routes/
│   │   ├── models/
│   │   └── middleware/
│   └── package.json
├── frontend/
│   ├── package.json
│   ├── src/
│   └── public/
└── contracts/
```

### **2. Push to GitHub**

```bash
# Initialize git if not already done
git init
git add .
git commit -m "Prepare for Vercel deployment"

# Push to GitHub
git remote add origin https://github.com/yourusername/shardeum-quest.git
git branch -M main
git push -u origin main
```

### **3. Deploy on Vercel**

#### **Option A: Vercel Dashboard (Recommended)**

1. **Go to Vercel Dashboard**
   - Visit https://vercel.com/dashboard
   - Sign in with GitHub

2. **Import Project**
   - Click "New Project"
   - Select your `shardeum-quest` repository
   - Click "Import"

3. **Configure Build Settings**
   - **Framework Preset**: Other
   - **Root Directory**: Leave empty (uses root)
   - **Build Command**: `npm run vercel-build`
   - **Output Directory**: `frontend/build`
   - **Install Command**: `npm install`

4. **Set Environment Variables**
   
   Add these environment variables in the Vercel dashboard:

   ```env
   MONGODB_URI=mongodb+srv://Cluster33216:VFBiYkVjYF1E@cluster33216.ldxyoqv.mongodb.net/?retryWrites=true&w=majority&appName=Cluster33216
   CONTRACT_ADDRESS=0x1169Ea80acD04e4379a72e54Dd4B1810e31efC14
   REACT_APP_CONTRACT_ADDRESS=0x1169Ea80acD04e4379a72e54Dd4B1810e31efC14
   PRIVATE_KEY=72c5b7841f0cebdf4d84805e05fc4d3fadd33824d36ae900df1a383bc0c4c41a
   JWT_SECRET=your-super-secure-jwt-secret-change-this-in-production
   NODE_ENV=production
   ```

5. **Deploy**
   - Click "Deploy"
   - Wait for deployment to complete

#### **Option B: Vercel CLI**

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy
vercel

# Follow prompts:
# - Link to existing project? N
# - Project name: shardeum-quest
# - Directory: ./
# - Want to override settings? N

# Deploy to production
vercel --prod
```

### **4. Configure Domain and Settings**

1. **Custom Domain** (Optional)
   - Go to Project Settings → Domains
   - Add your custom domain

2. **Function Configuration**
   - Functions tab → Configure if needed
   - Default settings should work

3. **Environment Variables**
   - Double-check all environment variables are set
   - Make sure `MONGODB_URI` is correct

### **5. Verify Deployment**

#### **Test Frontend**
Visit your Vercel URL (e.g., `https://your-project.vercel.app`)

- ✅ Website loads
- ✅ Connect wallet works
- ✅ Quests page shows all quests
- ✅ Profile page accessible

#### **Test API Endpoints**
Test these URLs directly:

```bash
# Replace with your actual Vercel URL
VERCEL_URL="https://your-project.vercel.app"

# Test health endpoint
curl "$VERCEL_URL/api/health"

# Test quests
curl "$VERCEL_URL/api/quests"

# Test leaderboard
curl "$VERCEL_URL/api/users/leaderboard"

# Test stats
curl "$VERCEL_URL/api/users/stats"
```

Expected responses:
- ✅ `/api/health`: `{"status":"OK","timestamp":"...","environment":"Vercel Serverless"}`
- ✅ `/api/quests`: Array of 5 quests
- ✅ `/api/users/leaderboard`: User leaderboard
- ✅ `/api/users/stats`: Platform statistics

## 🔧 Configuration Files Explained

### **vercel.json**
```json
{
  "version": 2,
  "builds": [
    {
      "src": "frontend/package.json",
      "use": "@vercel/static-build",
      "config": { "distDir": "build" }
    },
    {
      "src": "backend/api/index.js",
      "use": "@vercel/node",
      "config": { "maxLambdaSize": "50mb" }
    }
  ],
  "routes": [
    { "src": "/api/(.*)", "dest": "/backend/api/index.js" },
    { "src": "/(.*)", "dest": "/frontend/build/$1" }
  ]
}
```

### **backend/api/index.js**
- Serverless function entry point
- Handles all API routes
- MongoDB connection with caching
- CORS configured for production

## 🚨 Important Notes

### **Environment Variables**
- ⚠️ **NEVER** commit actual environment variables to GitHub
- Use Vercel dashboard to set environment variables
- Each environment variable must be set separately

### **Database Connection**
- MongoDB Atlas is required (not local MongoDB)
- Connection pooling optimized for serverless
- Database connections are cached between function calls

### **CORS Configuration**
- Frontend and backend are on the same domain
- CORS configured to allow requests from Vercel domain
- Update CORS origins after deployment

### **Rate Limiting**
- Configured for production with `trustProxy: true`
- Limits API abuse on serverless functions
- Different limits for different endpoint types

## 🔄 Continuous Deployment

Once deployed, Vercel automatically:
- ✅ Builds and deploys on every `git push` to main branch
- ✅ Creates preview deployments for pull requests
- ✅ Handles SSL certificates automatically
- ✅ Provides global CDN distribution

## 📊 Monitoring and Analytics

### **Vercel Dashboard**
- Functions tab: Monitor serverless function performance
- Analytics tab: Traffic and performance metrics
- Speed Insights: Core Web Vitals

### **Database Monitoring**
- MongoDB Atlas dashboard for database metrics
- Connection pooling statistics
- Query performance insights

## 🛠️ Troubleshooting

### **Common Issues**

#### **1. Build Failures**
```bash
# Check build logs in Vercel dashboard
# Common fixes:
npm install --prefix frontend
npm install --prefix backend
```

#### **2. API Not Working**
- Check environment variables are set
- Verify MongoDB connection string
- Check function logs in Vercel dashboard

#### **3. CORS Errors**
```javascript
// Update CORS origins in backend/api/index.js
app.use(cors({
  origin: ['https://your-actual-vercel-domain.vercel.app'],
  credentials: true
}));
```

#### **4. Database Connection Issues**
- Verify MongoDB Atlas IP whitelist includes `0.0.0.0/0`
- Check connection string format
- Ensure database user has proper permissions

### **Debugging Steps**

1. **Check Vercel Function Logs**
   - Go to Functions tab in Vercel dashboard
   - Click on specific function invocation
   - View detailed logs

2. **Test API Endpoints Individually**
   ```bash
   curl https://your-project.vercel.app/api/health -v
   ```

3. **Check Network Tab in Browser**
   - Open DevTools → Network
   - Look for failed API calls
   - Check response errors

## 🚀 Performance Optimization

### **Frontend Optimization**
- React build is automatically optimized by Vercel
- Static assets served via CDN
- Automatic compression and caching

### **Backend Optimization**
- Connection pooling for MongoDB
- Efficient serverless function cold starts
- Rate limiting prevents abuse

### **Monitoring Performance**
- Use Vercel Analytics for frontend metrics
- Monitor MongoDB Atlas for database performance
- Set up alerts for function errors

## 📱 Post-Deployment

### **Update Frontend Configuration**
After deployment, update your frontend API calls if needed:

```javascript
// Usually not needed since we use relative URLs
const API_BASE = process.env.NODE_ENV === 'production' 
  ? 'https://your-project.vercel.app' 
  : 'http://localhost:3001';
```

### **Test Complete User Journey**
1. ✅ Connect wallet
2. ✅ Browse quests
3. ✅ Complete a quest
4. ✅ Update profile
5. ✅ Check leaderboard

### **Security Checklist**
- ✅ Environment variables properly set
- ✅ JWT secret is secure
- ✅ MongoDB credentials are secure
- ✅ Private keys are secure (for smart contract deployment only)
- ✅ CORS is properly configured

## 🎉 Success!

Your ShardeumQuest platform is now live on Vercel with:
- ✅ Frontend hosted on global CDN
- ✅ Backend running as serverless functions
- ✅ MongoDB Atlas integration
- ✅ Automatic HTTPS and security headers
- ✅ Global availability and performance

**Your live URLs:**
- Frontend: `https://your-project.vercel.app`
- API: `https://your-project.vercel.app/api/*`

Share your live ShardeumQuest platform with the community! 🚀

---

## 📞 Support

If you encounter issues:
1. Check Vercel function logs
2. Verify all environment variables
3. Test API endpoints individually
4. Check MongoDB Atlas connectivity
5. Review this deployment guide

**Happy deploying!** 🎊