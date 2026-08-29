const fs = require('fs');
const path = require('path');
require('dotenv').config();

const DB_DIR = path.join(__dirname, 'db');
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

let mysqlPool = null;
const isMysql = process.env.DB_TYPE === 'mysql';

if (isMysql) {
  try {
    const mysql = require('mysql2/promise');
    mysqlPool = mysql.createPool({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASS || '',
      database: process.env.DB_NAME || 'eusta_db',
      port: Number(process.env.DB_PORT) || 3306,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });
    console.log(`[Database] Initializing with Hostinger MySQL driver (${process.env.DB_HOST}/${process.env.DB_NAME})`);
  } catch (err) {
    console.warn(`[Database] MySQL pool creation failed, falling back to JSON storage:`, err.message);
    mysqlPool = null;
  }
} else {
  console.log(`[Database] Initializing with JSON file storage mode (${DB_DIR})`);
}

// Helper: JSON File IO
function readJsonDb(filename, defaultVal = []) {
  try {
    const filePath = path.join(DB_DIR, filename);
    if (!fs.existsSync(filePath)) return defaultVal;
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  } catch (e) {
    return defaultVal;
  }
}

function writeJsonDb(filename, data) {
  try {
    const filePath = path.join(DB_DIR, filename);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
  } catch (e) {
    console.error(`[Database] Error writing ${filename}:`, e);
  }
}

// Database Initialization & Auto Migration / Auto Seeding
async function initDb() {
  if (mysqlPool) {
    try {
      // Create Users Table
      await mysqlPool.query(`
        CREATE TABLE IF NOT EXISTS users (
          id VARCHAR(64) PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          email VARCHAR(255) UNIQUE NOT NULL,
          password VARCHAR(255) NOT NULL,
          role VARCHAR(50) DEFAULT 'admin',
          phone VARCHAR(50),
          plan VARCHAR(50) DEFAULT '6 Months',
          status VARCHAR(50) DEFAULT 'Active',
          joinedDate VARCHAR(50),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
      `);

      // Create Products Table
      await mysqlPool.query(`
        CREATE TABLE IF NOT EXISTS products (
          id VARCHAR(64) PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          sku VARCHAR(100),
          category VARCHAR(100),
          price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
          oldPrice DECIMAL(10,2),
          stock INT DEFAULT 0,
          status VARCHAR(50) DEFAULT 'Active',
          description TEXT,
          image VARCHAR(500),
          images JSON,
          onSale TINYINT(1) DEFAULT 0,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
      `);

      // Create Categories Table
      await mysqlPool.query(`
        CREATE TABLE IF NOT EXISTS categories (
          id VARCHAR(64) PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          icon VARCHAR(100) DEFAULT 'chair',
          status VARCHAR(50) DEFAULT 'Active',
          created VARCHAR(50),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
      `);

      // Create Enquiries Table
      await mysqlPool.query(`
        CREATE TABLE IF NOT EXISTS enquiries (
          id VARCHAR(64) PRIMARY KEY,
          name VARCHAR(255),
          email VARCHAR(255),
          phone VARCHAR(100),
          subject VARCHAR(255),
          message TEXT,
          date VARCHAR(100),
          status VARCHAR(50) DEFAULT 'Unread',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
      `);

      // Create Subscription Plans Table
      await mysqlPool.query(`
        CREATE TABLE IF NOT EXISTS subscription_plans (
          duration INT PRIMARY KEY,
          cost DECIMAL(10,2) NOT NULL
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
      `);

      // Create Subscriptions Table
      await mysqlPool.query(`
        CREATE TABLE IF NOT EXISTS subscriptions (
          id VARCHAR(64) PRIMARY KEY,
          email VARCHAR(255) UNIQUE NOT NULL,
          date VARCHAR(100),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
      `);

      // Create Settings Table
      await mysqlPool.query(`
        CREATE TABLE IF NOT EXISTS settings (
          setting_key VARCHAR(100) PRIMARY KEY,
          setting_val TEXT
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
      `);

      // Create Product Clicks Table
      await mysqlPool.query(`
        CREATE TABLE IF NOT EXISTS product_clicks (
          product_id VARCHAR(64) PRIMARY KEY,
          views INT DEFAULT 0,
          whatsappClicks INT DEFAULT 0,
          lastClicked VARCHAR(100)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
      `);

      // Create Analytics Logs Table
      await mysqlPool.query(`
        CREATE TABLE IF NOT EXISTS analytics_logs (
          id INT AUTO_INCREMENT PRIMARY KEY,
          productId VARCHAR(64),
          productName VARCHAR(255),
          type VARCHAR(50),
          timestamp VARCHAR(100)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
      `);

      console.log('[Database] Hostinger MySQL Tables verified/created successfully.');

      // Auto-Seed if Users table is empty
      const [userRows] = await mysqlPool.query('SELECT COUNT(*) as cnt FROM users');
      if (userRows[0].cnt === 0) {
        console.log('[Database] Seeding initial data from JSON files to MySQL...');
        const users = readJsonDb('users.json', []);
        for (const u of users) {
          await mysqlPool.query(
            'INSERT INTO users (id, name, email, password, role, phone, plan, status, joinedDate) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [u.id, u.name, u.email, u.password, u.role || 'admin', u.phone || '', u.plan || '6 Months', u.status || 'Active', u.joinedDate || '']
          );
        }

        const products = readJsonDb('products.json', []);
        for (const p of products) {
          await mysqlPool.query(
            'INSERT INTO products (id, name, sku, category, price, oldPrice, stock, status, description, image, images, onSale) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [p.id, p.name, p.sku, p.category, p.price, p.oldPrice, p.stock, p.status, p.description, p.image, JSON.stringify(p.images || [p.image]), p.onSale ? 1 : 0]
          );
        }

        const categories = readJsonDb('categories.json', []);
        for (const c of categories) {
          await mysqlPool.query(
            'INSERT INTO categories (id, name, icon, status, created) VALUES (?, ?, ?, ?, ?)',
            [c.id, c.name, c.icon, c.status, c.created]
          );
        }

        const enquiries = readJsonDb('enquiries.json', []);
        for (const e of enquiries) {
          await mysqlPool.query(
            'INSERT INTO enquiries (id, name, email, phone, subject, message, date, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [e.id, e.name, e.email, e.phone, e.subject, e.message, e.date, e.status]
          );
        }

        const plans = readJsonDb('subscription_plans.json', []);
        for (const plan of plans) {
          await mysqlPool.query(
            'INSERT INTO subscription_plans (duration, cost) VALUES (?, ?)',
            [plan.duration, plan.cost]
          );
        }

        const settingsObj = readJsonDb('settings.json', {});
        for (const [k, v] of Object.entries(settingsObj)) {
          await mysqlPool.query(
            'INSERT INTO settings (setting_key, setting_val) VALUES (?, ?)',
            [k, typeof v === 'object' ? JSON.stringify(v) : String(v)]
          );
        }
        console.log('[Database] MySQL initial seeding complete.');
      }

    } catch (err) {
      console.error('[Database] MySQL Table initialization error:', err);
      console.warn('[Database] Falling back to JSON file database mode');
      mysqlPool = null;
    }
  }
}

// --- USERS MANAGEMENT ---
async function getUsers() {
  if (mysqlPool) {
    const [rows] = await mysqlPool.query('SELECT id, name, email, password, role, phone, plan, status, joinedDate FROM users');
    return rows;
  }
  return readJsonDb('users.json', []);
}

async function getUserByEmail(email) {
  const users = await getUsers();
  return users.find(u => u.email.toLowerCase() === email.toLowerCase());
}

async function getUserById(id) {
  const users = await getUsers();
  return users.find(u => u.id === id);
}

async function createUser(user) {
  const newUser = {
    id: user.id || 'u_' + Date.now(),
    name: user.name || 'User',
    email: user.email,
    password: user.password,
    role: user.role || 'admin',
    phone: user.phone || '',
    plan: user.plan || '6 Months',
    status: user.status || 'Active',
    joinedDate: user.joinedDate || new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  };

  if (mysqlPool) {
    await mysqlPool.query(
      'INSERT INTO users (id, name, email, password, role, phone, plan, status, joinedDate) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [newUser.id, newUser.name, newUser.email, newUser.password, newUser.role, newUser.phone, newUser.plan, newUser.status, newUser.joinedDate]
    );
  } else {
    const users = readJsonDb('users.json', []);
    users.push(newUser);
    writeJsonDb('users.json', users);
  }
  return newUser;
}

async function updateUser(id, updates) {
  if (mysqlPool) {
    const fields = [];
    const vals = [];
    if (updates.name !== undefined) { fields.push('name = ?'); vals.push(updates.name); }
    if (updates.email !== undefined) { fields.push('email = ?'); vals.push(updates.email); }
    if (updates.role !== undefined) { fields.push('role = ?'); vals.push(updates.role); }
    if (updates.phone !== undefined) { fields.push('phone = ?'); vals.push(updates.phone); }
    if (updates.plan !== undefined) { fields.push('plan = ?'); vals.push(updates.plan); }
    if (updates.status !== undefined) { fields.push('status = ?'); vals.push(updates.status); }
    if (updates.password !== undefined) { fields.push('password = ?'); vals.push(updates.password); }

    if (fields.length > 0) {
      vals.push(id);
      await mysqlPool.query(`UPDATE users SET ${fields.join(', ')} WHERE id = ?`, vals);
    }
    return getUserById(id);
  } else {
    const users = readJsonDb('users.json', []);
    const idx = users.findIndex(u => u.id === id);
    if (idx !== -1) {
      users[idx] = { ...users[idx], ...updates };
      writeJsonDb('users.json', users);
      return users[idx];
    }
    return null;
  }
}

async function deleteUser(id) {
  if (mysqlPool) {
    await mysqlPool.query('DELETE FROM users WHERE id = ?', [id]);
  } else {
    const users = readJsonDb('users.json', []);
    const filtered = users.filter(u => u.id !== id);
    writeJsonDb('users.json', filtered);
  }
  return true;
}

// --- PRODUCTS MANAGEMENT ---
async function getProducts(filters = {}) {
  let products = [];
  if (mysqlPool) {
    const [rows] = await mysqlPool.query('SELECT * FROM products');
    products = rows.map(r => ({
      ...r,
      price: Number(r.price),
      oldPrice: r.oldPrice ? Number(r.oldPrice) : null,
      stock: Number(r.stock),
      onSale: Boolean(r.onSale),
      images: typeof r.images === 'string' ? JSON.parse(r.images) : (r.images || [r.image])
    }));
  } else {
    products = readJsonDb('products.json', []);
  }

  if (filters.category && filters.category !== 'All' && filters.category !== 'For You') {
    products = products.filter(p => p.category.toLowerCase() === filters.category.toLowerCase());
  }
  if (filters.deals === 'true' || filters.deals === true) {
    products = products.filter(p => p.onSale === true || (p.oldPrice && p.oldPrice > p.price));
  }
  if (filters.id) {
    return products.find(p => p.id === filters.id) || null;
  }
  return products;
}

async function createProduct(body) {
  const mainImg = body.image || 'assets/imgs/furniture/product/product1.png';
  let imgList = Array.isArray(body.images) && body.images.length > 0 ? body.images : [mainImg];

  const newProduct = {
    id: body.id || 'prod_' + Date.now(),
    name: body.name || 'New Product',
    sku: body.sku || 'EUS-' + Math.floor(Math.random() * 1000),
    category: body.category || 'Furniture',
    price: Number(body.price) || 0,
    oldPrice: body.oldPrice ? Number(body.oldPrice) : null,
    stock: Number(body.stock) || 0,
    status: body.status || 'Active',
    description: body.description || '',
    image: mainImg,
    images: imgList,
    onSale: body.onSale || false
  };

  if (mysqlPool) {
    await mysqlPool.query(
      'INSERT INTO products (id, name, sku, category, price, oldPrice, stock, status, description, image, images, onSale) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [newProduct.id, newProduct.name, newProduct.sku, newProduct.category, newProduct.price, newProduct.oldPrice, newProduct.stock, newProduct.status, newProduct.description, newProduct.image, JSON.stringify(newProduct.images), newProduct.onSale ? 1 : 0]
    );
  } else {
    const products = readJsonDb('products.json', []);
    products.push(newProduct);
    writeJsonDb('products.json', products);
  }

  return newProduct;
}

async function updateProduct(id, body) {
  const existing = await getProducts({ id });
  if (!existing) return null;

  const mainImg = body.image !== undefined ? body.image : existing.image;
  let imgList = existing.images || [existing.image];
  if (Array.isArray(body.images)) {
    imgList = body.images.length > 0 ? body.images : [mainImg];
  }

  const updated = {
    ...existing,
    name: body.name !== undefined ? body.name : existing.name,
    sku: body.sku !== undefined ? body.sku : existing.sku,
    category: body.category !== undefined ? body.category : existing.category,
    price: body.price !== undefined ? Number(body.price) : existing.price,
    oldPrice: body.oldPrice !== undefined ? (body.oldPrice ? Number(body.oldPrice) : null) : existing.oldPrice,
    stock: body.stock !== undefined ? Number(body.stock) : existing.stock,
    status: body.status !== undefined ? body.status : existing.status,
    description: body.description !== undefined ? body.description : existing.description,
    image: mainImg,
    images: imgList,
    onSale: body.onSale !== undefined ? body.onSale : existing.onSale
  };

  if (mysqlPool) {
    await mysqlPool.query(
      'UPDATE products SET name = ?, sku = ?, category = ?, price = ?, oldPrice = ?, stock = ?, status = ?, description = ?, image = ?, images = ?, onSale = ? WHERE id = ?',
      [updated.name, updated.sku, updated.category, updated.price, updated.oldPrice, updated.stock, updated.status, updated.description, updated.image, JSON.stringify(updated.images), updated.onSale ? 1 : 0, id]
    );
  } else {
    const products = readJsonDb('products.json', []);
    const idx = products.findIndex(p => p.id === id);
    if (idx !== -1) {
      products[idx] = updated;
      writeJsonDb('products.json', products);
    }
  }

  return updated;
}

async function deleteProduct(id) {
  if (mysqlPool) {
    await mysqlPool.query('DELETE FROM products WHERE id = ?', [id]);
  } else {
    const products = readJsonDb('products.json', []);
    const updated = products.filter(p => p.id !== id);
    writeJsonDb('products.json', updated);
  }
  return true;
}

async function bulkImportProducts(items) {
  const importedList = [];
  for (let idx = 0; idx < items.length; idx++) {
    const p = items[idx];
    const mainImg = p.image || 'assets/imgs/furniture/product/product1.png';
    let imgList = Array.isArray(p.images) && p.images.length > 0 ? p.images : [mainImg];

    const price = Number(p.price) || 0;
    const stock = Number(p.stock) || 0;
    let status = p.status || 'Active';
    if (stock === 0) status = 'Out of Stock';
    else if (stock < 10 && !p.status) status = 'Low Stock';

    const prodObj = {
      id: 'prod_' + (Date.now() + idx),
      name: p.name || 'Imported Product',
      sku: p.sku || ('EU-IMP-' + Math.floor(1000 + Math.random() * 9000)),
      category: p.category || 'Furniture',
      price,
      oldPrice: p.oldPrice ? Number(p.oldPrice) : null,
      stock,
      status,
      description: p.description || '',
      image: mainImg,
      images: imgList,
      onSale: p.onSale || false
    };

    if (mysqlPool) {
      await mysqlPool.query(
        'INSERT INTO products (id, name, sku, category, price, oldPrice, stock, status, description, image, images, onSale) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [prodObj.id, prodObj.name, prodObj.sku, prodObj.category, prodObj.price, prodObj.oldPrice, prodObj.stock, prodObj.status, prodObj.description, prodObj.image, JSON.stringify(prodObj.images), prodObj.onSale ? 1 : 0]
      );
    } else {
      const products = readJsonDb('products.json', []);
      products.push(prodObj);
      writeJsonDb('products.json', products);
    }
    importedList.push(prodObj);
  }
  return importedList;
}

// --- CATEGORIES MANAGEMENT ---
async function getCategories() {
  if (mysqlPool) {
    const [rows] = await mysqlPool.query('SELECT * FROM categories');
    return rows;
  }
  return readJsonDb('categories.json', []);
}

async function createCategory(body) {
  const newCat = {
    id: 'cat_' + Date.now(),
    name: body.name || 'New Category',
    icon: body.icon || 'chair',
    status: body.status || 'Active',
    created: new Date().toISOString().split('T')[0]
  };

  if (mysqlPool) {
    await mysqlPool.query(
      'INSERT INTO categories (id, name, icon, status, created) VALUES (?, ?, ?, ?, ?)',
      [newCat.id, newCat.name, newCat.icon, newCat.status, newCat.created]
    );
  } else {
    const categories = readJsonDb('categories.json', []);
    categories.push(newCat);
    writeJsonDb('categories.json', categories);
  }
  return newCat;
}

async function updateCategory(id, body) {
  const categories = await getCategories();
  const existing = categories.find(c => c.id === id);
  if (!existing) return null;

  const updated = {
    ...existing,
    name: body.name !== undefined ? body.name : existing.name,
    icon: body.icon !== undefined ? body.icon : existing.icon,
    status: body.status !== undefined ? body.status : existing.status
  };

  if (mysqlPool) {
    await mysqlPool.query(
      'UPDATE categories SET name = ?, icon = ?, status = ? WHERE id = ?',
      [updated.name, updated.icon, updated.status, id]
    );
  } else {
    const cats = readJsonDb('categories.json', []);
    const idx = cats.findIndex(c => c.id === id);
    if (idx !== -1) {
      cats[idx] = updated;
      writeJsonDb('categories.json', cats);
    }
  }
  return updated;
}

async function deleteCategory(id) {
  if (mysqlPool) {
    await mysqlPool.query('DELETE FROM categories WHERE id = ?', [id]);
  } else {
    const categories = readJsonDb('categories.json', []);
    const updated = categories.filter(c => c.id !== id);
    writeJsonDb('categories.json', updated);
  }
  return true;
}

// --- ENQUIRIES MANAGEMENT ---
async function getEnquiries() {
  if (mysqlPool) {
    const [rows] = await mysqlPool.query('SELECT * FROM enquiries ORDER BY created_at DESC');
    return rows;
  }
  return readJsonDb('enquiries.json', []);
}

async function createEnquiry(body) {
  const newEnq = {
    id: 'enq_' + Date.now(),
    name: body.name || 'Anonymous',
    email: body.email || '',
    phone: body.phone || '',
    subject: body.subject || 'No Subject',
    message: body.message || '',
    date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    status: 'Unread'
  };

  if (mysqlPool) {
    await mysqlPool.query(
      'INSERT INTO enquiries (id, name, email, phone, subject, message, date, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [newEnq.id, newEnq.name, newEnq.email, newEnq.phone, newEnq.subject, newEnq.message, newEnq.date, newEnq.status]
    );
  } else {
    const enquiries = readJsonDb('enquiries.json', []);
    enquiries.unshift(newEnq);
    writeJsonDb('enquiries.json', enquiries);
  }
  return newEnq;
}

async function updateEnquiry(id, status) {
  if (mysqlPool) {
    await mysqlPool.query('UPDATE enquiries SET status = ? WHERE id = ?', [status, id]);
    const [rows] = await mysqlPool.query('SELECT * FROM enquiries WHERE id = ?', [id]);
    return rows[0] || null;
  } else {
    const enquiries = readJsonDb('enquiries.json', []);
    const idx = enquiries.findIndex(e => e.id === id);
    if (idx !== -1) {
      enquiries[idx].status = status;
      writeJsonDb('enquiries.json', enquiries);
      return enquiries[idx];
    }
    return null;
  }
}

async function deleteEnquiry(id) {
  if (mysqlPool) {
    await mysqlPool.query('DELETE FROM enquiries WHERE id = ?', [id]);
  } else {
    const enquiries = readJsonDb('enquiries.json', []);
    const updated = enquiries.filter(e => e.id !== id);
    writeJsonDb('enquiries.json', updated);
  }
  return true;
}

// --- SUBSCRIPTION PLANS & SUBSCRIPTIONS ---
async function getSubscriptionPlans() {
  if (mysqlPool) {
    const [rows] = await mysqlPool.query('SELECT duration, cost FROM subscription_plans');
    return rows.map(r => ({ duration: Number(r.duration), cost: Number(r.cost) }));
  }
  return readJsonDb('subscription_plans.json', []);
}

async function saveSubscriptionPlan(duration, cost) {
  if (mysqlPool) {
    await mysqlPool.query(
      'INSERT INTO subscription_plans (duration, cost) VALUES (?, ?) ON DUPLICATE KEY UPDATE cost = ?',
      [duration, cost, cost]
    );
  } else {
    const plans = readJsonDb('subscription_plans.json', []);
    const idx = plans.findIndex(p => p.duration === duration);
    if (idx !== -1) plans[idx].cost = cost;
    else plans.push({ duration, cost });
    writeJsonDb('subscription_plans.json', plans);
  }
  return getSubscriptionPlans();
}

async function deleteSubscriptionPlan(duration) {
  if (mysqlPool) {
    await mysqlPool.query('DELETE FROM subscription_plans WHERE duration = ?', [duration]);
  } else {
    const plans = readJsonDb('subscription_plans.json', []);
    const updated = plans.filter(p => p.duration !== duration);
    writeJsonDb('subscription_plans.json', updated);
  }
  return getSubscriptionPlans();
}

async function getSubscriptions() {
  if (mysqlPool) {
    const [rows] = await mysqlPool.query('SELECT * FROM subscriptions');
    return rows;
  }
  return readJsonDb('subscriptions.json', []);
}

async function createSubscription(email) {
  const subs = await getSubscriptions();
  if (subs.find(s => s.email.toLowerCase() === email.toLowerCase())) {
    return { success: true, message: 'Already subscribed' };
  }

  const newSub = {
    id: 'sub_' + Date.now(),
    email: email,
    date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  };

  if (mysqlPool) {
    await mysqlPool.query(
      'INSERT INTO subscriptions (id, email, date) VALUES (?, ?, ?)',
      [newSub.id, newSub.email, newSub.date]
    );
  } else {
    const list = readJsonDb('subscriptions.json', []);
    list.push(newSub);
    writeJsonDb('subscriptions.json', list);
  }
  return { success: true, message: 'Subscribed successfully' };
}

async function deleteSubscription(id) {
  if (mysqlPool) {
    await mysqlPool.query('DELETE FROM subscriptions WHERE id = ?', [id]);
  } else {
    const list = readJsonDb('subscriptions.json', []);
    const updated = list.filter(s => s.id !== id);
    writeJsonDb('subscriptions.json', updated);
  }
  return true;
}

// --- SETTINGS MANAGEMENT ---
async function getSettings() {
  const defaultSettings = {
    whatsappNumber: "919000000000",
    whatsappText: "Hi, I have a general inquiry about Eusta Furniture.",
    businessName: "Eusta Store",
    contactEmail: "info@eusta.com",
    contactPhone: "+91 9000000000",
    address: "Bangalore, India",
    facebook: "https://facebook.com/eusta",
    instagram: "https://instagram.com/eusta",
    niche: "furniture",
    logoUrl: "assets/imgs/logo/logo.png",
    logoText: "Eusta Store",
    primaryColor: "#059669",
    secondaryColor: "#064E3B",
    backgroundColor: "#FFFFFF",
    textColor: "#064E3B",
    headingColor: "#064E3B",
    themePreset: "gold"
  };

  if (mysqlPool) {
    const [rows] = await mysqlPool.query('SELECT setting_key, setting_val FROM settings');
    const result = { ...defaultSettings };
    for (const r of rows) {
      try {
        result[r.setting_key] = JSON.parse(r.setting_val);
      } catch (e) {
        result[r.setting_key] = r.setting_val;
      }
    }
    return result;
  }

  const jsonSettings = readJsonDb('settings.json', null);
  return jsonSettings || defaultSettings;
}

async function updateSettings(updates) {
  const current = await getSettings();
  const merged = { ...current, ...updates };

  if (mysqlPool) {
    for (const [k, v] of Object.entries(updates)) {
      const valStr = typeof v === 'object' ? JSON.stringify(v) : String(v);
      await mysqlPool.query(
        'INSERT INTO settings (setting_key, setting_val) VALUES (?, ?) ON DUPLICATE KEY UPDATE setting_val = ?',
        [k, valStr, valStr]
      );
    }
  } else {
    writeJsonDb('settings.json', merged);
  }
  return merged;
}

// --- ANALYTICS & CLICK TRACKING ---
async function trackClick(productId, type = 'view') {
  const products = await getProducts();
  const prodObj = products.find(p => p.id === productId);

  if (mysqlPool) {
    await mysqlPool.query(`
      INSERT INTO product_clicks (product_id, views, whatsappClicks, lastClicked)
      VALUES (?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        views = views + IF(? = 'view', 1, 0),
        whatsappClicks = whatsappClicks + IF(? = 'whatsapp', 1, 0),
        lastClicked = ?;
    `, [productId, type === 'view' ? 1 : 0, type === 'whatsapp' ? 1 : 0, new Date().toISOString(), type, type, new Date().toISOString()]);

    await mysqlPool.query(
      'INSERT INTO analytics_logs (productId, productName, type, timestamp) VALUES (?, ?, ?, ?)',
      [productId, prodObj ? prodObj.name : 'Unknown Product', type, new Date().toISOString()]
    );
  } else {
    let clickData = readJsonDb('product_clicks.json', { products: {}, logs: [] });
    if (!clickData || typeof clickData !== 'object' || Array.isArray(clickData)) {
      clickData = { products: {}, logs: [] };
    }
    if (!clickData.products) clickData.products = {};
    if (!clickData.logs) clickData.logs = [];

    if (!clickData.products[productId]) {
      clickData.products[productId] = {
        id: productId,
        name: prodObj ? prodObj.name : 'Unknown Product',
        category: prodObj ? prodObj.category : 'General',
        views: 0,
        whatsappClicks: 0,
        lastClicked: new Date().toISOString()
      };
    }

    const item = clickData.products[productId];
    if (type === 'whatsapp') item.whatsappClicks = (item.whatsappClicks || 0) + 1;
    else item.views = (item.views || 0) + 1;
    item.lastClicked = new Date().toISOString();

    clickData.logs.unshift({
      productId,
      productName: prodObj ? prodObj.name : item.name,
      type: type || 'view',
      timestamp: new Date().toISOString()
    });
    if (clickData.logs.length > 100) clickData.logs = clickData.logs.slice(0, 100);

    writeJsonDb('product_clicks.json', clickData);
  }
  return true;
}

async function getAnalytics() {
  const products = await getProducts();
  let clickProducts = {};
  let logs = [];

  if (mysqlPool) {
    const [clickRows] = await mysqlPool.query('SELECT * FROM product_clicks');
    for (const r of clickRows) {
      clickProducts[r.product_id] = {
        views: Number(r.views),
        whatsappClicks: Number(r.whatsappClicks),
        lastClicked: r.lastClicked
      };
    }
    const [logRows] = await mysqlPool.query('SELECT productId, productName, type, timestamp FROM analytics_logs ORDER BY id DESC LIMIT 100');
    logs = logRows;
  } else {
    const clickData = readJsonDb('product_clicks.json', { products: {}, logs: [] });
    clickProducts = clickData.products || {};
    logs = clickData.logs || [];
  }

  let totalViews = 0;
  let totalWhatsappClicks = 0;
  const categoryMap = {};

  const fullList = products.map(p => {
    const stats = clickProducts[p.id] || { views: 0, whatsappClicks: 0, lastClicked: null };
    const views = Number(stats.views) || 0;
    const waClicks = Number(stats.whatsappClicks) || 0;
    totalViews += views;
    totalWhatsappClicks += waClicks;

    const convRate = views > 0 ? ((waClicks / views) * 100).toFixed(1) : '0.0';

    const cat = p.category || 'Uncategorized';
    if (!categoryMap[cat]) {
      categoryMap[cat] = { category: cat, views: 0, whatsappClicks: 0, productCount: 0 };
    }
    categoryMap[cat].views += views;
    categoryMap[cat].whatsappClicks += waClicks;
    categoryMap[cat].productCount += 1;

    return {
      id: p.id,
      name: p.name,
      sku: p.sku || '',
      category: p.category || 'General',
      price: p.price || 0,
      image: p.image || 'assets/imgs/furniture/product/product1.png',
      status: p.status || 'Active',
      views,
      whatsappClicks: waClicks,
      totalClicks: views + waClicks,
      conversionRate: Number(convRate),
      lastClicked: stats.lastClicked
    };
  });

  const sortedByClicks = [...fullList].sort((a, b) => (b.views + b.whatsappClicks) - (a.views + a.whatsappClicks));
  const sortedByViewsAsc = [...fullList].sort((a, b) => a.views - b.views);
  const overallConvRate = totalViews > 0 ? ((totalWhatsappClicks / totalViews) * 100).toFixed(1) : '0.0';

  return {
    summary: {
      totalProducts: products.length,
      totalViews,
      totalWhatsappClicks,
      overallConversionRate: Number(overallConvRate)
    },
    mostClicked: sortedByClicks.slice(0, 5),
    leastVisited: sortedByViewsAsc.slice(0, 5),
    categoryStats: Object.values(categoryMap),
    products: fullList,
    logs
  };
}

async function resetAnalytics() {
  if (mysqlPool) {
    await mysqlPool.query('TRUNCATE TABLE product_clicks');
    await mysqlPool.query('TRUNCATE TABLE analytics_logs');
  } else {
    writeJsonDb('product_clicks.json', { products: {}, logs: [] });
  }
  return true;
}

module.exports = {
  initDb,
  getUsers,
  getUserByEmail,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  bulkImportProducts,
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  getEnquiries,
  createEnquiry,
  updateEnquiry,
  deleteEnquiry,
  getSubscriptionPlans,
  saveSubscriptionPlan,
  deleteSubscriptionPlan,
  getSubscriptions,
  createSubscription,
  deleteSubscription,
  getSettings,
  updateSettings,
  trackClick,
  getAnalytics,
  resetAnalytics
};
