
async function test() {
  console.log("Starting test...");
  const baseUrl = 'http://localhost:3000';

  // 1. Fetch current status from mockDB/DB using a public API or just login
  // We can't easily fetch without login, let's login as admin
  const loginRes = await fetch(baseUrl + '/api/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identifier: 'admin@kumawatpe.com', password: 'adminpassword' })
  });
  
  const loginText = await loginRes.text();
  console.log("Admin Login:", loginRes.status, loginText);
  const cookie = loginRes.headers.get('set-cookie');

  // We need an orderId. Let's assume ORD001 from seed
  const orderId = 'ORD001';

  // 2. Change status as admin
  const statusRes = await fetch(baseUrl + '/admin/api/order/status', {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Cookie': cookie 
    },
    body: JSON.stringify({ orderId, newStatus: 'Confirmed', cancelReason: '' })
  });
  
  const statusData = await statusRes.text();
  console.log("Status Update:", statusRes.status, statusData);


  // 3. Fetch User Dashboard (using admin cookie because ORD001 belongs to Admin)
  const dashRes = await fetch(baseUrl + '/dashboard', {
    headers: { 'Cookie': cookie }
  });
  const dashHtml = await dashRes.text();
  
  // extract all badge statuses
  const matches = [...dashHtml.matchAll(/id="badge-status-([^"]+)" data-status="([^"]+)"/g)];
  console.log("Found Badges in Dashboard:");
  matches.forEach(m => console.log(`Order: ${m[1]}, Status: ${m[2]}`));
  
  // 5. Fetch Order Details
  const orderRes = await fetch(baseUrl + `/order/${orderId}`, {
    headers: { 'Cookie': cookie }
  });
  const orderHtml = await orderRes.text();
  // We look for 'Confirmed' in the HTML or timeline
  console.log("Order Details HTML length:", orderHtml.length);
  // We can check the statuses array logic or just search for Confirmed
  const isConfirmedInOrder = orderHtml.includes('Confirmed');
  console.log("Is Confirmed in Order Details?", isConfirmedInOrder);
}

test().catch(console.error);
