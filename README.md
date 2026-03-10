# 🌌 AETHER

### Cyber-Luxe Streetwear OS
**Automated Fulfillment • Next-Gen UI • High-Velocity Sync**

<div align="center">
  <img src="public/assets/hero_3d.png" alt="AETHER 3D Hoodie" width="600" />
</div>

---

## ⚡ The AETHER Edge

AETHER is not just a store; it's a high-performance commerce engine designed for the Gen-Z streetwear landscape. Leveraging **Deep Sync** technology and a **Cyber-Luxe WebGL UI**, AETHER bridges the gap between digital drops and physical fulfillment.

### 🌪️ 500x Velocity Sync
Our custom **Deep Sync Architecture** fetches real-time mockup generation data directly from Printify's global API clusters.
- **Parallel Processing**: Syncs thousands of product variants in milliseconds.
- **Native Color Accuracy**: Direct hex-code extraction for 100% color-perfect swatches.
- **Auto-Unlock**: Real-time dashboard status updates via instant webhooks.

### 💎 Cyber-Luxe UI/UX
- **Liquid Shaders**: Interactive Three.js global background with mouse-responsive refraction.
- **Sticker-System Buy Box**: High-conversion product layout with scarcity indicators and trust badges.
- **Matrix Data Streams**: Real-time HUD elements providing an immersive "Digital Drop" experience.

---

## 🛠️ Tech Stack

- **Frontend**: React 19 + Vite + Three.js (Fiber/Drei)
- **Backend**: Node.js + Express (Edge-optimized for Vercel)
- **Database**: Supabase (PostgreSQL with RLS)
- **Payments**: Razorpay Integrated
- **Fulfillment**: Printify API V2 (Automated)

---

## 🚀 Quick Start (Local)

1. **Clone & Install**
   ```bash
   git clone <repo-url>
   cd Aether
   npm install
   ```

2. **Environment Setup**
   Copy `.env.example` to `.env` and fill in your keys:
   - `PRINTIFY_API_KEY`
   - `SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY`
   - `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET`

3. **Ignition**
   ```bash
   npm run dev
   ```

---

## 🌐 Deployment (Vercel)

AETHER is production-ready for **Vercel**. 
1. Push to GitHub.
2. Import to Vercel.
3. Add Env Vars (including `APP_URL=https://store-aether.vercel.app`).
4. **Link Your Shop**: Run these commands from your terminal to link and populate your live site:
   ```bash
   npx tsx scripts/register_webhooks.ts
   npx tsx scripts/sync_all.ts
   ```

---

<div align="center">
  <sub>Built for the next generation of designers. <strong>AETHER OS v1.0</strong></sub>
</div>
