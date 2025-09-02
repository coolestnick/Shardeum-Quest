# 🚀 Direct Vercel Deployment (No GitHub Required)

If you want to deploy directly without GitHub, follow these steps:

## Step 1: Login to Vercel CLI

```bash
vercel login
```
Choose your preferred login method (email, GitHub, etc.)

## Step 2: Set Environment Variables

Create a `.vercel` directory and add environment variables:

```bash
mkdir .vercel
echo '{
  "env": {
    "MONGODB_URI": "mongodb+srv://Cluster33216:VFBiYkVjYF1E@cluster33216.ldxyoqv.mongodb.net/?retryWrites=true&w=majority&appName=Cluster33216",
    "CONTRACT_ADDRESS": "0x1169Ea80acD04e4379a72e54Dd4B1810e31efC14",
    "REACT_APP_CONTRACT_ADDRESS": "0x1169Ea80acD04e4379a72e54Dd4B1810e31efC14",
    "PRIVATE_KEY": "72c5b7841f0cebdf4d84805e05fc4d3fadd33824d36ae900df1a383bc0c4c41a",
    "JWT_SECRET": "your-super-secure-jwt-secret-change-this",
    "NODE_ENV": "production"
  }
}' > .vercel/project.json
```

## Step 3: Deploy

```bash
vercel --prod
```

Answer the prompts:
- Set up and deploy? Y
- Which scope? (select your account)
- Link to existing project? N
- Project name: shardeum-quest
- In which directory is your code located? ./

The CLI will:
1. Build your frontend
2. Deploy serverless functions
3. Give you a live URL

## Step 4: Test Your Deployment

Once deployed, test these endpoints:
- https://your-project.vercel.app (frontend)
- https://your-project.vercel.app/api/health (API health)
- https://your-project.vercel.app/api/quests (quests API)

## Alternative: Use Vercel Dashboard

1. Go to https://vercel.com
2. Sign up/login
3. Drag and drop your project folder
4. Configure environment variables in dashboard
5. Deploy

## 🎯 What You Get

Your ShardeumQuest platform will be live with:
- ✅ Frontend hosted globally
- ✅ Backend as serverless functions
- ✅ MongoDB Atlas integration
- ✅ Automatic HTTPS
- ✅ Custom domain support
- ✅ Auto-deployments (if using GitHub)

## 🔧 Post-Deployment

Update any hardcoded URLs in your frontend to use the new Vercel domain if needed.

Your app will be available at: `https://shardeum-quest.vercel.app` (or similar)