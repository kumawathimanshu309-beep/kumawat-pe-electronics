const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1366, height: 768 });

  // Wait for server to be fully up
  await new Promise(r => setTimeout(r, 2000));

  console.log('Testing Admin Login...');
  await page.goto('http://localhost:3000/login');
  await page.waitForSelector('input[name="username"]');
  await page.type('input[name="username"]', 'admin@kumawatpe.com');
  await page.type('input[name="password"]', 'Admin123!');
  await Promise.all([
    page.click('button[type="submit"]'),
    page.waitForNavigation()
  ]);

  console.log('Taking screenshot of Admin Orders...');
  await page.goto('http://localhost:3000/admin');
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: 'C:\\Users\\DELL\\.gemini\\antigravity\\brain\\fe123c4e-f9f7-4a6c-862b-298efef93909\\admin_orders.png', fullPage: true });

  console.log('Logout Admin...');
  await page.goto('http://localhost:3000/auth/logout');

  // Let's create an order for a user or use the existing mock one
  console.log('Registering test user...');
  await page.goto('http://localhost:3000/register');
  const randId = Math.floor(Math.random() * 100000);
  await page.type('input[name="name"]', 'Test User');
  await page.type('input[name="email"]', `test${randId}@test.com`);
  await page.type('input[name="mobile"]', `98765${randId.toString().padStart(5, '0')}`);
  await page.type('input[name="password"]', 'Password123!');
  await Promise.all([
    page.click('button[type="submit"]'),
    page.waitForNavigation()
  ]);

  console.log('Taking screenshot of Notifications...');
  await page.goto('http://localhost:3000/dashboard?tab=notifications');
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: 'C:\\Users\\DELL\\.gemini\\antigravity\\brain\\fe123c4e-f9f7-4a6c-862b-298efef93909\\notifications_empty.png' });

  // Add something to cart to create an order
  console.log('Adding to cart...');
  await page.goto('http://localhost:3000/store');
  // Wait for the store products
  await new Promise(r => setTimeout(r, 1000));
  
  // Click first Add to Cart button
  const btns = await page.$$('button.btn-outline');
  for (let b of btns) {
    const text = await b.evaluate(el => el.textContent);
    if (text.includes('Add')) {
      await b.click();
      break;
    }
  }
  await new Promise(r => setTimeout(r, 1000));
  await page.goto('http://localhost:3000/checkout');
  
  // Fill checkout form
  await page.type('input[name="houseNo"]', '123');
  await page.type('input[name="street"]', 'Test St');
  await page.type('input[name="city"]', 'Test City');
  await page.type('input[name="state"]', 'Test State');
  await page.type('input[name="pincode"]', '123456');
  
  await Promise.all([
    page.click('button[type="submit"].btn-full'),
    page.waitForNavigation({ waitUntil: 'networkidle0' })
  ]);
  
  console.log('Taking screenshot of Order Success / Order Details...');
  // The success page redirects to /order-success/:id but wait we need the new Amazon style one
  // Get order ID from URL
  const url = page.url();
  const orderId = url.split('/').pop();
  
  console.log('Order ID created: ' + orderId);
  
  await page.goto('http://localhost:3000/order/' + orderId);
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: 'C:\\Users\\DELL\\.gemini\\antigravity\\brain\\fe123c4e-f9f7-4a6c-862b-298efef93909\\order_details.png', fullPage: true });

  console.log('Taking screenshot of Invoice...');
  await page.goto('http://localhost:3000/invoice/' + orderId);
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: 'C:\\Users\\DELL\\.gemini\\antigravity\\brain\\fe123c4e-f9f7-4a6c-862b-298efef93909\\invoice.png', fullPage: true });

  console.log('Cancel Order & screenshot My Orders...');
  await page.goto('http://localhost:3000/dashboard');
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: 'C:\\Users\\DELL\\.gemini\\antigravity\\brain\\fe123c4e-f9f7-4a6c-862b-298efef93909\\my_orders.png', fullPage: true });

  await browser.close();
  console.log('Done screenshots');
})();
