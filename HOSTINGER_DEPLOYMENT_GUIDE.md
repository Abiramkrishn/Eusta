# Eusta - Hostinger Deployment & Hosting Guide

This guide provides step-by-step instructions for hosting the **Eusta Platform** (Frontend, Express Backend, and MySQL Database) on **Hostinger Web Hosting / Cloud Hosting / VPS**.

---

## 📋 Prerequisites & Architecture Overview

- **Hosting Provider**: Hostinger (Single Web Hosting, Business Web Hosting, Cloud Hosting, or VPS).
- **Backend Runtime**: Node.js v16+ (Supported via Hostinger hPanel **Node.js App Manager** or SSH/VPS).
- **Database**: Hostinger **MySQL / MariaDB Database** (Included free in Hostinger hPanel).

---

## 🗄️ Step 1: Create MySQL Database on Hostinger hPanel

1. Log in to **Hostinger hPanel** (`hpanel.hostinger.com`).
2. Go to **Databases** -> **Management** or **MySQL Databases**.
3. Create a new database:
   - **Database Name**: `u123456789_eusta_db`
   - **Database Username**: `u123456789_eusta_user`
   - **Password**: `YourStrongPassword123!`
4. Click **Create**. Note down the database name, username, and password.
5. *(Optional)* Click **phpMyAdmin** next to the created database to verify database access.

---

## 📁 Step 2: Upload Project Files to Hostinger

1. Open **File Manager** in Hostinger hPanel (or connect via FTP / SSH).
2. Upload the project files into your domain directory (e.g. `public_html` or `/home/u123456789/domains/yourdomain.com/public_html`).
3. Ensure the following core structure is uploaded:
   ```
   public_html/
   ├── admin/
   ├── super-admin/
   ├── user/
   ├── assets/
   ├── db/
   ├── db.js
   ├── server.js
   ├── package.json
   └── .env
   ```

---

## ⚙️ Step 3: Configure Environment Variables (`.env`)

In the project root directory on Hostinger, create or edit the `.env` file with your Hostinger database details:

```env
PORT=3000
NODE_ENV=production

# Database Mode: Use 'mysql' for Hostinger Production MySQL
DB_TYPE=mysql

# Hostinger MySQL Database Credentials
DB_HOST=localhost
DB_USER=u123456789_eusta_user
DB_PASS=YourStrongPassword123!
DB_NAME=u123456789_eusta_db
DB_PORT=3306

# Secret key for JWT / Sessions
JWT_SECRET=eusta_super_secret_production_key_2026
```

---

## 🚀 Step 4: Configure Node.js Application Manager in Hostinger

### Option A: Using Hostinger hPanel Node.js Selector (Shared/Cloud Hosting)
1. In hPanel, go to **Advanced** -> **Node.js**.
2. Click **Create Application**.
3. Set the following fields:
   - **Node.js version**: `18.x` or `20.x`
   - **Application root**: `public_html`
   - **Application URL**: `yourdomain.com`
   - **Application startup file**: `server.js`
4. Click **Create**.
5. Once created, click **Run npm install** or open Terminal in hPanel to run:
   ```bash
   npm install
   ```
6. Click **Restart Application**.

### Option B: Using SSH / VPS / PM2 Process Manager
If hosting on Hostinger VPS or SSH access:
1. SSH into your server:
   ```bash
   ssh root@YOUR_SERVER_IP
   ```
2. Navigate to your project folder:
   ```bash
   cd /var/www/html/eusta
   ```
3. Install dependencies:
   ```bash
   npm install --production
   ```
4. Start with PM2 process manager for continuous 24/7 uptime:
   ```bash
   npm install -g pm2
   pm2 start server.js --name "eusta-portal"
   pm2 save
   pm2 startup
   ```

---

## 🔒 Step 5: Automated Database Initialization & Seeding

The Eusta backend includes an **Automated Database Migration & Seeding Engine** (`db.js`).

Upon first launch with `DB_TYPE=mysql`:
1. It connects to Hostinger MySQL automatically.
2. It creates all 9 database tables (`users`, `products`, `categories`, `enquiries`, `subscription_plans`, `subscriptions`, `settings`, `product_clicks`, `analytics_logs`).
3. It seeds initial default data (admin user, categories, products, store settings) automatically if the tables are empty.

You can verify the created tables in **Hostinger hPanel phpMyAdmin**.

---

## 🌐 Step 6: Verify Deployment

Open your web browser and navigate to:
- **Landing Portal**: `https://yourdomain.com/`
- **User Storefront**: `https://yourdomain.com/user/`
- **Admin Panel**: `https://yourdomain.com/admin/`
- **Super Admin Panel**: `https://yourdomain.com/super-admin/`
- **API Health Check**: `https://yourdomain.com/api/health`

---

## 🛠️ Troubleshooting & Support

| Issue | Solution |
| :--- | :--- |
| `API Route Not Found (404)` | Ensure `server.js` is running via Hostinger Node.js app runner or PM2. |
| `MySQL Access Denied` | Double check `DB_USER`, `DB_PASS`, and `DB_NAME` in `.env`. Ensure Hostinger database user has full privileges. |
| `File Upload Permission Error` | Ensure `user/assets/imgs/uploads` folder has write permissions (`755` or `777`). |
