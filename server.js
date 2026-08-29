const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const db = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = path.resolve(__dirname);

// --- MIDDLEWARES ---
app.use(cors());
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// Request Logger
app.use((req, res, next) => {
  if (!req.url.startsWith('/assets/')) {
    console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`);
  }
  next();
});

// --- API ROUTES ---

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Eusta Portal API is running smoothly',
    timestamp: new Date().toISOString(),
    dbType: process.env.DB_TYPE || 'json'
  });
});

// File Upload (Base64)
app.post('/api/upload', (req, res) => {
  const body = req.body || {};
  if (!body.image) {
    return res.status(400).json({ success: false, message: 'No image data provided' });
  }

  try {
    const matches = body.image.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      return res.json({ success: true, url: body.image });
    }

    const mimeType = matches[1];
    const ext = mimeType.split('/')[1] || 'png';
    const buffer = Buffer.from(matches[2], 'base64');

    const uploadsDir = path.join(__dirname, 'user', 'assets', 'imgs', 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const filename = `logo_${Date.now()}.${ext}`;
    const filePath = path.join(uploadsDir, filename);
    fs.writeFileSync(filePath, buffer);

    const fileUrl = `assets/imgs/uploads/${filename}`;
    return res.json({ success: true, url: fileUrl });
  } catch (err) {
    console.error('[API] Upload Error:', err);
    return res.status(500).json({ success: false, message: 'Upload failed' });
  }
});

// Authentication
app.post('/api/auth/signin', async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email and password required' });
  }
  const user = await db.getUserByEmail(email);
  if (user && user.password === password) {
    return res.json({
      success: true,
      token: `token_${user.id}_${Date.now()}`,
      user: { id: user.id, name: user.name, email: user.email, role: user.role }
    });
  }
  return res.status(401).json({ success: false, message: 'Invalid email or password' });
});

app.post('/api/auth/signup', async (req, res) => {
  const { email, password, name, role } = req.body || {};
  if (!email || !password || !name) {
    return res.status(400).json({ success: false, message: 'Missing required fields' });
  }
  const existing = await db.getUserByEmail(email);
  if (existing) {
    return res.status(400).json({ success: false, message: 'User already exists' });
  }
  const newUser = await db.createUser({ name, email, password, role: role || 'admin' });
  return res.json({
    success: true,
    message: 'Registered successfully',
    user: { id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role }
  });
});

app.get('/api/auth/me', async (req, res) => {
  const authHeader = req.headers['authorization'] || '';
  const token = authHeader.replace('Bearer ', '');
  if (!token || !token.startsWith('token_')) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }
  const tokenParts = token.split('_');
  tokenParts.shift();
  tokenParts.pop();
  const userId = tokenParts.join('_');
  const user = await db.getUserById(userId);
  if (user) {
    return res.json({ success: true, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  }
  return res.status(401).json({ success: false, message: 'Unauthorized' });
});

// Products
app.get('/api/products', async (req, res) => {
  const filters = {
    category: req.query.category,
    deals: req.query.deals,
    id: req.query.id
  };
  const result = await db.getProducts(filters);
  if (filters.id && !result) {
    return res.status(404).json({ message: 'Product not found' });
  }
  return res.json(result);
});

app.post('/api/products', async (req, res) => {
  const newProd = await db.createProduct(req.body);
  return res.json(newProd);
});

app.put('/api/products', async (req, res) => {
  const { id } = req.body || {};
  if (!id) return res.status(400).json({ message: 'Product ID required' });
  const updated = await db.updateProduct(id, req.body);
  if (!updated) return res.status(404).json({ message: 'Product not found' });
  return res.json(updated);
});

app.delete('/api/products', async (req, res) => {
  const id = req.query.id;
  if (!id) return res.status(400).json({ message: 'Product ID required' });
  await db.deleteProduct(id);
  return res.json({ success: true });
});

// Bulk Product Import
app.post('/api/products/import', async (req, res) => {
  const body = req.body || {};
  const items = Array.isArray(body.products) ? body.products : (Array.isArray(body) ? body : []);
  if (items.length === 0) {
    return res.status(400).json({ success: false, message: 'No valid product data found to import' });
  }
  const importedList = await db.bulkImportProducts(items);
  return res.json({ success: true, count: importedList.length, products: importedList });
});

// Categories
app.get('/api/categories', async (req, res) => {
  const categories = await db.getCategories();
  return res.json(categories);
});

app.post('/api/categories', async (req, res) => {
  const newCat = await db.createCategory(req.body);
  return res.json(newCat);
});

app.put('/api/categories', async (req, res) => {
  const { id } = req.body || {};
  if (!id) return res.status(400).json({ message: 'Category ID required' });
  const updated = await db.updateCategory(id, req.body);
  if (!updated) return res.status(404).json({ message: 'Category not found' });
  return res.json(updated);
});

app.delete('/api/categories', async (req, res) => {
  const id = req.query.id;
  if (!id) return res.status(400).json({ message: 'Category ID required' });
  await db.deleteCategory(id);
  return res.json({ success: true });
});

// Enquiries
app.get('/api/enquiries', async (req, res) => {
  const enquiries = await db.getEnquiries();
  return res.json(enquiries);
});

app.post('/api/enquiries', async (req, res) => {
  const newEnq = await db.createEnquiry(req.body);
  return res.json(newEnq);
});

app.put('/api/enquiries', async (req, res) => {
  const { id, status } = req.body || {};
  if (!id) return res.status(400).json({ message: 'Enquiry ID required' });
  const updated = await db.updateEnquiry(id, status || 'Replied');
  if (!updated) return res.status(404).json({ message: 'Enquiry not found' });
  return res.json(updated);
});

app.delete('/api/enquiries', async (req, res) => {
  const id = req.query.id;
  if (!id) return res.status(400).json({ message: 'Enquiry ID required' });
  await db.deleteEnquiry(id);
  return res.json({ success: true });
});

// Users Management
app.get('/api/users', async (req, res) => {
  const users = await db.getUsers();
  return res.json(users.map(u => ({
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    phone: u.phone,
    plan: u.plan,
    status: u.status,
    joinedDate: u.joinedDate
  })));
});

app.post('/api/users', async (req, res) => {
  const newUser = await db.createUser(req.body);
  return res.json({
    id: newUser.id,
    name: newUser.name,
    email: newUser.email,
    role: newUser.role,
    phone: newUser.phone,
    plan: newUser.plan,
    status: newUser.status,
    joinedDate: newUser.joinedDate
  });
});

app.put('/api/users', async (req, res) => {
  const { id } = req.body || {};
  if (!id) return res.status(400).json({ message: 'User ID required' });
  const updated = await db.updateUser(id, req.body);
  if (!updated) return res.status(404).json({ message: 'User not found' });
  return res.json({
    id: updated.id,
    name: updated.name,
    email: updated.email,
    role: updated.role,
    phone: updated.phone,
    plan: updated.plan,
    status: updated.status,
    joinedDate: updated.joinedDate
  });
});

app.delete('/api/users', async (req, res) => {
  const id = req.query.id;
  if (!id) return res.status(400).json({ message: 'User ID required' });
  await db.deleteUser(id);
  return res.json({ success: true });
});

// Subscription Plans
app.get('/api/subscription-plans', async (req, res) => {
  const plans = await db.getSubscriptionPlans();
  return res.json(plans);
});

app.post('/api/subscription-plans', async (req, res) => {
  const { duration, cost } = req.body || {};
  if (duration === undefined || cost === undefined || isNaN(Number(duration)) || isNaN(Number(cost))) {
    return res.status(400).json({ success: false, message: 'Invalid duration or cost' });
  }
  const plans = await db.saveSubscriptionPlan(Number(duration), Number(cost));
  return res.json({ success: true, plans });
});

app.delete('/api/subscription-plans', async (req, res) => {
  const duration = req.query.duration;
  if (duration === undefined || isNaN(Number(duration))) {
    return res.status(400).json({ success: false, message: 'Duration parameter required' });
  }
  const plans = await db.deleteSubscriptionPlan(Number(duration));
  return res.json({ success: true, plans });
});

// Subscriptions
app.get('/api/subscriptions', async (req, res) => {
  const subs = await db.getSubscriptions();
  return res.json(subs);
});

app.post('/api/subscriptions', async (req, res) => {
  const { email } = req.body || {};
  if (!email) return res.status(400).json({ success: false, message: 'Email required' });
  const result = await db.createSubscription(email);
  return res.json(result);
});

app.delete('/api/subscriptions', async (req, res) => {
  const id = req.query.id;
  if (!id) return res.status(400).json({ message: 'Subscription ID required' });
  await db.deleteSubscription(id);
  return res.json({ success: true });
});

// Settings (NEW API ENDPOINT)
app.get('/api/settings', async (req, res) => {
  const settings = await db.getSettings();
  return res.json(settings);
});

app.post('/api/settings', async (req, res) => {
  const updated = await db.updateSettings(req.body);
  return res.json({ success: true, settings: updated });
});

app.put('/api/settings', async (req, res) => {
  const updated = await db.updateSettings(req.body);
  return res.json({ success: true, settings: updated });
});

// Analytics & Click Tracker
app.post('/api/analytics/track', async (req, res) => {
  const { productId, type } = req.body || {};
  if (!productId) return res.status(400).json({ success: false, message: 'Missing productId' });
  await db.trackClick(productId, type || 'view');
  return res.json({ success: true });
});

app.get('/api/analytics', async (req, res) => {
  const analytics = await db.getAnalytics();
  return res.json(analytics);
});

app.post('/api/analytics/reset', async (req, res) => {
  await db.resetAnalytics();
  return res.json({ success: true, message: 'Analytics reset successfully' });
});

// --- STATIC FILE SERVING & PRETTY URLS ---
app.use(express.static(PUBLIC_DIR, { index: false }));

// Fallback for pretty URLs and directory indices
app.use((req, res, next) => {
  if (req.method !== 'GET') return next();

  let safeUrl = req.path;
  if (safeUrl === '/') safeUrl = '/index.html';

  let filePath = path.join(PUBLIC_DIR, safeUrl);

  // Security check: prevent directory traversal
  if (!filePath.startsWith(PUBLIC_DIR)) {
    return res.status(403).send('Forbidden');
  }

  fs.stat(filePath, (err, stats) => {
    if (!err && stats.isFile()) {
      return res.sendFile(filePath);
    }
    if (!err && stats.isDirectory()) {
      const indexFile = path.join(filePath, 'index.html');
      if (fs.existsSync(indexFile)) {
        return res.sendFile(indexFile);
      }
    }
    // Try appending .html
    const altHtml = filePath + '.html';
    if (fs.existsSync(altHtml) && fs.statSync(altHtml).isFile()) {
      return res.sendFile(altHtml);
    }

    // 404 Page
    res.status(404).send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>404 Not Found - Eusta</title>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet">
        <style>
          body { font-family: 'Inter', sans-serif; background-color: #0f0f0f; color: #ffffff; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; margin: 0; }
          .container { text-align: center; }
          h1 { font-size: 6rem; margin: 0; background: linear-gradient(135deg, #ffffff, #B18B5E); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
          p { font-size: 1.25rem; color: rgba(255, 255, 255, 0.5); margin-top: 0; margin-bottom: 2rem; }
          a { background-color: #B18B5E; color: white; padding: 0.75rem 1.5rem; border-radius: 0.375rem; text-decoration: none; font-weight: 500; transition: all 0.2s; }
          a:hover { background-color: #96724b; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>404</h1>
          <p>Oops! The page you are looking for does not exist.</p>
          <a href="/">Go to Home</a>
        </div>
      </body>
      </html>
    `);
  });
});

// Server Initialization
db.initDb().then(() => {
  app.listen(PORT, () => {
    console.log(`\n==================================================`);
    console.log(` Eusta Production Server is running on http://localhost:${PORT}`);
    console.log(` Mode: ${process.env.NODE_ENV || 'production'} | DB: ${process.env.DB_TYPE || 'json'}`);
    console.log(`==================================================\n`);
  });
}).catch(err => {
  console.error('[Server] Failed to initialize database:', err);
  app.listen(PORT, () => {
    console.log(`[Server] Running without database pool on port ${PORT}`);
  });
});
