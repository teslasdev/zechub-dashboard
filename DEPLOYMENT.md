# 🚀 Deployment Guide for ZecHub Dashboard

## Vercel Deployment

### Prerequisites
- Vercel account connected to your GitHub repository
- Node.js 23+ runtime (configured in Vercel)
- Nillion Builder API key (optional, for production Nillion features)

---

## 📋 Step-by-Step Deployment

### 1. **Configure Node.js Version**

In Vercel project settings:
- Go to **Settings** → **General** → **Node.js Version**
- Select **23.x** (required for Nillion SDK)

### 2. **Set Environment Variables**

Go to **Settings** → **Environment Variables** and add:

#### Required (for Nillion features):
```bash
NILLION_BUILDER_PRIVATE_KEY=your_private_key_here
```
> Get your key from: https://subscription.nillion.com/

#### Optional (uses defaults if not set):
```bash
NILCHAIN_URL=http://rpc.testnet.nilchain-rpc-proxy.nilogy.xyz
NILAUTH_URL=https://nilauth.sandbox.app-cluster.sandbox.nilogy.xyz
NILDB_NODES=https://nildb-stg-n1.nillion.network,https://nildb-stg-n2.nillion.network,https://nildb-stg-n3.nillion.network
```

### 3. **Deploy**

```bash
# Option 1: Push to main branch (auto-deploys)
git push origin main

# Option 2: Deploy via Vercel CLI
npm i -g vercel
vercel --prod
```

---

## 🔍 Debugging Deployment Issues

### Issue: `/api/nillion/init` returns 500 error

**Possible causes:**

1. **Missing Environment Variable**
   - Check Vercel dashboard → Settings → Environment Variables
   - Ensure `NILLION_BUILDER_PRIVATE_KEY` is set
   - **Important:** Redeploy after adding variables

2. **Wrong Node.js Version**
   - Nillion SDK requires Node.js 23+
   - Check: Settings → General → Node.js Version
   - If using 20.x or 18.x, upgrade to 23.x

3. **API Key Invalid**
   - Visit https://subscription.nillion.com/
   - Generate new builder private key
   - Update in Vercel environment variables

### Check API Status

**GET Request (Health Check):**
```bash
curl https://your-app.vercel.app/api/nillion/init
```

Expected response:
```json
{
  "status": "ok",
  "message": "Nillion Init API is available",
  "config": {
    "hasPrivateKey": true,
    "nilchainUrl": "...",
    "nilauthUrl": "...",
    "nodeCount": 3,
    "nodeEnv": "production"
  }
}
```

**POST Request (Initialize):**
```bash
curl -X POST https://your-app.vercel.app/api/nillion/init
```

### View Logs

In Vercel dashboard:
1. Go to **Deployments**
2. Click on your latest deployment
3. Click **Functions** tab
4. Select `/api/nillion/init`
5. View real-time logs

Look for:
- `🔵 Nillion Init API called` - Request received
- `Environment check:` - Configuration status
- `❌ Missing NILLION_BUILDER_PRIVATE_KEY` - Missing env var
- `⚠️ Unauthorized error` - Auth issue (demo mode fallback)

---

## 🎯 Feature Status

### ✅ Works Without Nillion API Key:
- Zcash Block Explorer (transaction search)
- Network Metrics Dashboard
- Shielded Stats
- Viewing Key Management (client-side only)
- Mobile responsive UI

### 🔐 Requires Nillion API Key:
- Privacy Analytics Storage
- Confidential Compute Aggregations
- nilDB Integration

> **Note:** The app gracefully falls back to demo mode if Nillion SDK is unavailable. Users will see clear messaging about limitations.

---

## 🐛 Common Error Messages

### "Missing NILLION_BUILDER_PRIVATE_KEY"
**Solution:** Add environment variable in Vercel → Settings → Environment Variables → Redeploy

### "Using demo mode - Nillion subscription required"
**Solution:** This is a graceful fallback. To enable full features, subscribe at https://subscription.nillion.com/

### "Request failed with status code 401"
**Solution:** 
1. Verify API key is correct
2. Check Nillion subscription is active
3. Confirm DID is registered with Nillion network

### "Node.js version not supported"
**Solution:** Update Node.js version to 23.x in Vercel settings

---

## 📊 Monitoring

### Check Deployment Status:
```bash
# View deployments
vercel ls

# Check logs
vercel logs your-deployment-url
```

### Test All API Endpoints:
```bash
# Zcash Explorer API (should always work)
curl https://your-app.vercel.app/api/zcash?endpoint=stats

# Nillion Init (health check)
curl https://your-app.vercel.app/api/nillion/init

# Nillion Store (requires init first)
curl -X POST https://your-app.vercel.app/api/nillion/store \
  -H "Content-Type: application/json" \
  -d '{"userId":"test","pageViews":10,"sessionDuration":60,"interactions":5,"category":"test","platform":"web"}'
```

---

## 🔄 Updating Deployment

```bash
# 1. Make changes locally
git add .
git commit -m "Your changes"

# 2. Push to GitHub (auto-deploys)
git push origin main

# 3. Or deploy manually
vercel --prod
```

---

## 📞 Support

### Nillion SDK Issues:
- Docs: https://docs.nillion.com/
- Discord: https://discord.gg/nillion

### Zcash Block Explorer Issues:
- Blockchair API: https://blockchair.com/api/docs
- Zcash Docs: https://z.cash/developers/

### General Deployment:
- Vercel Docs: https://vercel.com/docs
- Next.js Docs: https://nextjs.org/docs

---

## ✅ Pre-Deployment Checklist

- [ ] Node.js version set to 23.x in Vercel
- [ ] Environment variables configured (at minimum check if you need Nillion features)
- [ ] Git repository connected to Vercel
- [ ] All dependencies in package.json
- [ ] API routes tested locally first
- [ ] Build succeeds locally: `npm run build`
- [ ] No console errors in browser after deployment
- [ ] Mobile responsiveness tested
- [ ] All pages load correctly

---

## 🎉 Success Indicators

Your deployment is successful when:
- ✅ All pages load without errors
- ✅ Zcash Block Explorer can search transactions
- ✅ Network Metrics display data
- ✅ Mobile navigation works (hamburger menu)
- ✅ Privacy Analytics shows initialization status (even if demo mode)

**Demo mode is OK!** The app is designed to work gracefully without full Nillion access.
