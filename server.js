const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;
const PUBLIC_DIR = path.resolve(__dirname);

const MIME_TYPES = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.eot': 'application/vnd.ms-fontobject',
  '.otf': 'font/otf'
};

// Database Helper
const DB_DIR = path.join(__dirname, 'db');
function readDb(file) {
  try {
    const data = fs.readFileSync(path.join(DB_DIR, file), 'utf8');
    return JSON.parse(data);
  } catch (e) {
    return [];
  }
}
function writeDb(file, data) {
  try {
    fs.writeFileSync(path.join(DB_DIR, file), JSON.stringify(data, null, 2), 'utf8');
  } catch (e) {
    console.error(`Error writing database ${file}:`, e);
  }
}

// Request Helper
function getRequestBody(req) {
  return new Promise((resolve) => {
    let body = '';
    req.on('data', chunk => { body += chunk.toString(); });
    req.on('end', () => {
      try {
        resolve(JSON.parse(body));
      } catch (e) {
        resolve({});
      }
    });
  });
}

// Response Helpers
function sendJson(res, statusCode, data) {
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.end(JSON.stringify(data));
}

// Main API Router
async function handleApi(req, res, pathname, searchParams) {
  // CORS Headers for all methods
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.end();
    return;
  }

  // Route matches
  // --- FILE UPLOADS ---
  if (pathname === '/api/upload' && req.method === 'POST') {
    const body = await getRequestBody(req);
    if (!body.image) {
      sendJson(res, 400, { success: false, message: 'No image data provided' });
      return;
    }

    try {
      const matches = body.image.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
      if (!matches || matches.length !== 3) {
        sendJson(res, 200, { success: true, url: body.image });
        return;
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
      sendJson(res, 200, { success: true, url: fileUrl });
    } catch (err) {
      console.error('Error saving uploaded file:', err);
      sendJson(res, 500, { success: false, message: 'Upload failed' });
    }
    return;
  }

  // --- AUTHENTICATION ---
  if (pathname === '/api/auth/signin' && req.method === 'POST') {
    const body = await getRequestBody(req);
    const users = readDb('users.json');
    const user = users.find(u => u.email === body.email && u.password === body.password);
    if (user) {
      sendJson(res, 200, { success: true, token: `token_${user.id}_${Date.now()}`, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
    } else {
      sendJson(res, 401, { success: false, message: 'Invalid email or password' });
    }
    return;
  }

  if (pathname === '/api/auth/signup' && req.method === 'POST') {
    const body = await getRequestBody(req);
    if (!body.email || !body.password || !body.name) {
      sendJson(res, 400, { success: false, message: 'Missing fields' });
      return;
    }
    const users = readDb('users.json');
    if (users.find(u => u.email === body.email)) {
      sendJson(res, 400, { success: false, message: 'User already exists' });
      return;
    }
    const newUser = {
      id: 'u_' + Date.now(),
      name: body.name,
      email: body.email,
      password: body.password,
      role: body.role || 'admin'
    };
    users.push(newUser);
    writeDb('users.json', users);
    sendJson(res, 200, { success: true, message: 'Registered successfully', user: { id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role } });
    return;
  }

  if (pathname === '/api/auth/me' && req.method === 'GET') {
    const authHeader = req.headers['authorization'] || '';
    const token = authHeader.replace('Bearer ', '');
    if (!token || !token.startsWith('token_')) {
      sendJson(res, 401, { success: false, message: 'Unauthorized' });
      return;
    }
    const tokenParts = token.split('_');
    tokenParts.shift(); // remove 'token'
    tokenParts.pop();   // remove timestamp
    const userId = tokenParts.join('_');
    const users = readDb('users.json');
    const user = users.find(u => u.id === userId);
    if (user) {
      sendJson(res, 200, { success: true, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
    } else {
      sendJson(res, 401, { success: false, message: 'Unauthorized' });
    }
    return;
  }

  // --- PRODUCTS ---
  if (pathname === '/api/products') {
    const products = readDb('products.json');
    if (req.method === 'GET') {
      let filtered = [...products];
      const category = searchParams.get('category');
      if (category && category !== 'All' && category !== 'For You') {
        filtered = filtered.filter(p => p.category.toLowerCase() === category.toLowerCase());
      }
      const deals = searchParams.get('deals');
      if (deals === 'true') {
        filtered = filtered.filter(p => p.onSale === true || (p.oldPrice && p.oldPrice > p.price));
      }
      const id = searchParams.get('id');
      if (id) {
        const prod = products.find(p => p.id === id);
        if (prod) {
          sendJson(res, 200, prod);
        } else {
          sendJson(res, 404, { message: 'Product not found' });
        }
        return;
      }
      sendJson(res, 200, filtered);
      return;
    }

    if (req.method === 'POST') {
      const body = await getRequestBody(req);
      const newProduct = {
        id: 'prod_' + Date.now(),
        name: body.name || 'New Product',
        sku: body.sku || 'EUS-' + Math.floor(Math.random() * 1000),
        category: body.category || 'Furniture',
        price: Number(body.price) || 0,
        oldPrice: Number(body.oldPrice) || null,
        stock: Number(body.stock) || 0,
        status: body.status || 'Active',
        description: body.description || '',
        image: body.image || 'assets/imgs/furniture/product/product1.png',
        onSale: body.onSale || false
      };
      products.push(newProduct);
      writeDb('products.json', products);
      sendJson(res, 200, newProduct);
      return;
    }

    if (req.method === 'PUT') {
      const body = await getRequestBody(req);
      const index = products.findIndex(p => p.id === body.id);
      if (index !== -1) {
        products[index] = {
          ...products[index],
          name: body.name !== undefined ? body.name : products[index].name,
          sku: body.sku !== undefined ? body.sku : products[index].sku,
          category: body.category !== undefined ? body.category : products[index].category,
          price: body.price !== undefined ? Number(body.price) : products[index].price,
          oldPrice: body.oldPrice !== undefined ? (body.oldPrice ? Number(body.oldPrice) : null) : products[index].oldPrice,
          stock: body.stock !== undefined ? Number(body.stock) : products[index].stock,
          status: body.status !== undefined ? body.status : products[index].status,
          description: body.description !== undefined ? body.description : products[index].description,
          image: body.image !== undefined ? body.image : products[index].image,
          onSale: body.onSale !== undefined ? body.onSale : products[index].onSale
        };
        writeDb('products.json', products);
        sendJson(res, 200, products[index]);
      } else {
        sendJson(res, 404, { message: 'Product not found' });
      }
      return;
    }

    if (req.method === 'DELETE') {
      const id = searchParams.get('id');
      const updated = products.filter(p => p.id !== id);
      writeDb('products.json', updated);
      sendJson(res, 200, { success: true });
      return;
    }
  }

  // --- CATEGORIES ---
  if (pathname === '/api/categories') {
    const categories = readDb('categories.json');
    if (req.method === 'GET') {
      sendJson(res, 200, categories);
      return;
    }

    if (req.method === 'POST') {
      const body = await getRequestBody(req);
      const newCat = {
        id: 'cat_' + Date.now(),
        name: body.name || 'New Category',
        icon: body.icon || 'chair',
        status: body.status || 'Active',
        created: new Date().toISOString().split('T')[0]
      };
      categories.push(newCat);
      writeDb('categories.json', categories);
      sendJson(res, 200, newCat);
      return;
    }

    if (req.method === 'PUT') {
      const body = await getRequestBody(req);
      const index = categories.findIndex(c => c.id === body.id);
      if (index !== -1) {
        categories[index] = {
          ...categories[index],
          name: body.name !== undefined ? body.name : categories[index].name,
          icon: body.icon !== undefined ? body.icon : categories[index].icon,
          status: body.status !== undefined ? body.status : categories[index].status
        };
        writeDb('categories.json', categories);
        sendJson(res, 200, categories[index]);
      } else {
        sendJson(res, 404, { message: 'Category not found' });
      }
      return;
    }

    if (req.method === 'DELETE') {
      const id = searchParams.get('id');
      const updated = categories.filter(c => c.id !== id);
      writeDb('categories.json', updated);
      sendJson(res, 200, { success: true });
      return;
    }
  }

  // --- ENQUIRIES ---
  if (pathname === '/api/enquiries') {
    const enquiries = readDb('enquiries.json');
    if (req.method === 'GET') {
      sendJson(res, 200, enquiries);
      return;
    }

    if (req.method === 'POST') {
      const body = await getRequestBody(req);
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
      enquiries.push(newEnq);
      writeDb('enquiries.json', enquiries);
      sendJson(res, 200, newEnq);
      return;
    }

    if (req.method === 'PUT') {
      const body = await getRequestBody(req);
      const index = enquiries.findIndex(e => e.id === body.id);
      if (index !== -1) {
        enquiries[index].status = body.status || 'Replied';
        writeDb('enquiries.json', enquiries);
        sendJson(res, 200, enquiries[index]);
      } else {
        sendJson(res, 404, { message: 'Enquiry not found' });
      }
      return;
    }

    if (req.method === 'DELETE') {
      const id = searchParams.get('id');
      const updated = enquiries.filter(e => e.id !== id);
      writeDb('enquiries.json', updated);
      sendJson(res, 200, { success: true });
      return;
    }
  }

  // --- USERS MANAGEMENT ---
  if (pathname === '/api/users') {
    const users = readDb('users.json');
    if (req.method === 'GET') {
      sendJson(res, 200, users.map(u => ({ id: u.id, name: u.name, email: u.email, role: u.role, phone: u.phone, plan: u.plan, status: u.status, joinedDate: u.joinedDate })));
      return;
    }

    if (req.method === 'POST') {
      const body = await getRequestBody(req);
      const newUser = {
        id: 'u_' + Date.now(),
        name: body.name || 'New Admin',
        email: body.email || '',
        password: body.password || 'password123',
        role: body.role || 'admin',
        phone: body.phone || '',
        plan: body.plan || '6 Months',
        status: body.status || 'Active',
        joinedDate: body.joinedDate || new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
      };
      users.push(newUser);
      writeDb('users.json', users);
      sendJson(res, 200, { id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role, phone: newUser.phone, plan: newUser.plan, status: newUser.status, joinedDate: newUser.joinedDate });
      return;
    }

    if (req.method === 'PUT') {
      const body = await getRequestBody(req);
      const index = users.findIndex(u => u.id === body.id);
      if (index !== -1) {
        users[index] = {
          ...users[index],
          name: body.name !== undefined ? body.name : users[index].name,
          email: body.email !== undefined ? body.email : users[index].email,
          role: body.role !== undefined ? body.role : users[index].role,
          phone: body.phone !== undefined ? body.phone : users[index].phone,
          plan: body.plan !== undefined ? body.plan : users[index].plan,
          status: body.status !== undefined ? body.status : users[index].status
        };
        if (body.password) {
          users[index].password = body.password;
        }
        writeDb('users.json', users);
        sendJson(res, 200, { id: users[index].id, name: users[index].name, email: users[index].email, role: users[index].role, phone: users[index].phone, plan: users[index].plan, status: users[index].status, joinedDate: users[index].joinedDate });
      } else {
        sendJson(res, 404, { message: 'User not found' });
      }
      return;
    }

    if (req.method === 'DELETE') {
      const id = searchParams.get('id');
      const updated = users.filter(u => u.id !== id);
      writeDb('users.json', updated);
      sendJson(res, 200, { success: true });
      return;
    }
  }

  // --- SUBSCRIPTION PLANS ---
  if (pathname === '/api/subscription-plans') {
    const plans = readDb('subscription_plans.json');
    if (req.method === 'GET') {
      sendJson(res, 200, plans);
      return;
    }

    if (req.method === 'POST') {
      const body = await getRequestBody(req);
      const duration = Number(body.duration);
      const cost = Number(body.cost);

      if (isNaN(duration) || isNaN(cost)) {
        sendJson(res, 400, { success: false, message: 'Invalid values' });
        return;
      }

      const existingIndex = plans.findIndex(p => p.duration === duration);
      if (existingIndex !== -1) {
        plans[existingIndex].cost = cost;
      } else {
        plans.push({ duration, cost });
      }

      writeDb('subscription_plans.json', plans);
      sendJson(res, 200, { success: true, plans });
      return;
    }

    if (req.method === 'DELETE') {
      const duration = Number(searchParams.get('duration'));
      const updated = plans.filter(p => p.duration !== duration);
      writeDb('subscription_plans.json', updated);
      sendJson(res, 200, { success: true, plans: updated });
      return;
    }
  }

  // --- SUBSCRIPTIONS ---
  if (pathname === '/api/subscriptions') {
    const subscriptions = readDb('subscriptions.json');
    if (req.method === 'GET') {
      sendJson(res, 200, subscriptions);
      return;
    }

    if (req.method === 'POST') {
      const body = await getRequestBody(req);
      if (!body.email) {
        sendJson(res, 400, { success: false, message: 'Email required' });
        return;
      }
      if (subscriptions.find(s => s.email.toLowerCase() === body.email.toLowerCase())) {
        sendJson(res, 200, { success: true, message: 'Already subscribed' });
        return;
      }
      const newSub = {
        id: 'sub_' + Date.now(),
        email: body.email,
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
      };
      subscriptions.push(newSub);
      writeDb('subscriptions.json', subscriptions);
      sendJson(res, 200, { success: true, message: 'Subscribed successfully' });
      return;
    }

    if (req.method === 'DELETE') {
      const id = searchParams.get('id');
      const updated = subscriptions.filter(s => s.id !== id);
      writeDb('subscriptions.json', updated);
      sendJson(res, 200, { success: true });
      return;
    }
  }

  // --- SETTINGS ---
  if (pathname === '/api/settings') {
    let settings = readDb('settings.json');
    if (Array.isArray(settings)) {
      settings = settings[0] || {};
    }
    if (req.method === 'GET') {
      sendJson(res, 200, settings);
      return;
    }

    if (req.method === 'POST') {
      const body = await getRequestBody(req);
      const updatedSettings = {
        ...settings,
        ...body
      };
      writeDb('settings.json', updatedSettings);
      sendJson(res, 200, updatedSettings);
      return;
    }
  }

  sendJson(res, 404, { message: 'API Route Not Found' });
}

const server = http.createServer((req, res) => {
  // Log request
  console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`);
  
  // Route API requests first
  const urlObj = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = urlObj.pathname;
  if (pathname.startsWith('/api/')) {
    handleApi(req, res, pathname, urlObj.searchParams);
    return;
  }

  // Strip query parameters
  let safeUrl = req.url.split('?')[0];
  if (safeUrl === '/') {
    safeUrl = '/index.html';
  }
  
  let filePath = path.join(PUBLIC_DIR, safeUrl);
  
  // Prevent directory traversal attacks
  if (!filePath.startsWith(PUBLIC_DIR)) {
    res.statusCode = 403;
    res.setHeader('Content-Type', 'text/html');
    res.end('<h1>403 Forbidden</h1><p>Access Denied</p>');
    return;
  }
  
  fs.stat(filePath, (err, stats) => {
    if (err) {
      // If file not found, try appending .html (pretty URLs)
      const altFilePath = filePath + '.html';
      fs.stat(altFilePath, (altErr, altStats) => {
        if (!altErr && altStats.isFile()) {
          serveFile(altFilePath, res);
        } else {
          serve404(res);
        }
      });
    } else if (stats.isDirectory()) {
      // If it's a directory, serve the index.html inside it
      const indexFilePath = path.join(filePath, 'index.html');
      fs.stat(indexFilePath, (indexErr, indexStats) => {
        if (!indexErr && indexStats.isFile()) {
          serveFile(indexFilePath, res);
        } else {
          serve404(res);
        }
      });
    } else if (stats.isFile()) {
      serveFile(filePath, res);
    } else {
      serve404(res);
    }
  });
});

function serveFile(filePath, res) {
  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';
  
  fs.readFile(filePath, (err, content) => {
    if (err) {
      console.error(`Error reading file ${filePath}:`, err);
      res.statusCode = 500;
      res.setHeader('Content-Type', 'text/plain');
      res.end(`Internal Server Error: ${err.code}`);
    } else {
      res.statusCode = 200;
      res.setHeader('Content-Type', contentType);
      // Disable cache for active development
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
      res.end(content);
    }
  });
}

function serve404(res) {
  res.statusCode = 404;
  res.setHeader('Content-Type', 'text/html');
  res.end(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>404 Not Found - Eusta</title>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet">
      <style>
        body {
          font-family: 'Inter', sans-serif;
          background-color: #0f0f0f;
          color: #ffffff;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100vh;
          margin: 0;
        }
        .container {
          text-align: center;
        }
        h1 {
          font-size: 6rem;
          margin: 0;
          background: linear-gradient(135deg, #ffffff, #B18B5E);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        p {
          font-size: 1.25rem;
          color: rgba(255, 255, 255, 0.5);
          margin-top: 0;
          margin-bottom: 2rem;
        }
        a {
          background-color: #B18B5E;
          color: white;
          padding: 0.75rem 1.5rem;
          border-radius: 0.375rem;
          text-decoration: none;
          font-weight: 500;
          transition: all 0.2s;
        }
        a:hover {
          background-color: #96724b;
        }
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
}

server.listen(PORT, () => {
  console.log(`\n==================================================`);
  console.log(` Eusta Portal is hosting on http://localhost:${PORT}`);
  console.log(` Press Ctrl+C to stop the server`);
  console.log(`==================================================\n`);
});
