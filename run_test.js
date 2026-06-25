const { spawn } = require('child_process');
const http = require('http');

console.log("Starting server...");
const server = spawn('node', ['server.js'], { env: { ...process.env, MONGO_URI: 'mongodb://invalid:27017' } });

server.stdout.on('data', (data) => {
  const str = data.toString();
  console.log(`[SERVER] ${str.trim()}`);
  if (str.includes('Server running at')) {
    console.log("Server is ready! Running test...");
    runTest();
  }
});

server.stderr.on('data', (data) => {
  console.error(`[SERVER ERROR] ${data.toString().trim()}`);
});

function runTest() {
  console.log("--- 1. POST /auth/login ---");
  const postData = JSON.stringify({
    username: 'admin@example.com',
    password: 'password123'
  });

  const reqOptions = {
    hostname: '127.0.0.1',
    port: 3000,
    path: '/auth/login',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    }
  };

  const req = http.request(reqOptions, (res) => {
    console.log(`STATUS: ${res.statusCode}`);
    console.log(`HEADERS: ${JSON.stringify(res.headers, null, 2)}`);
    
    const setCookie = res.headers['set-cookie'];
    if (!setCookie) {
      console.log("❌ ERROR: No Set-Cookie header received! The session was dropped.");
      server.kill();
      return;
    }
    
    console.log(`✅ Set-Cookie received: ${setCookie}`);
    
    const location = res.headers['location'];
    console.log(`Redirect Location: ${location}`);

    if (location && setCookie) {
      console.log(`\n--- 2. GET ${location} ---`);
      const cookieHeader = setCookie[0].split(';')[0];
      
      const getOptions = {
        hostname: '127.0.0.1',
        port: 3000,
        path: location,
        method: 'GET',
        headers: {
          'Cookie': cookieHeader
        }
      };
      
      const getReq = http.request(getOptions, (getRes) => {
        console.log(`STATUS: ${getRes.statusCode}`);
        console.log(`HEADERS: ${JSON.stringify(getRes.headers, null, 2)}`);
        
        if (getRes.statusCode === 302 && getRes.headers['location'] === '/login') {
          console.log("❌ ERROR: Redirected back to /login! Session was not recognized by isAuthenticated.");
        } else if (getRes.statusCode === 200) {
          console.log("✅ SUCCESS: Accessed protected route successfully.");
        } else {
          console.log(`UNKNOWN RESULT: Status ${getRes.statusCode}`);
        }
        server.kill();
      });
      getReq.end();
    } else {
      server.kill();
    }
  });

  req.on('error', (e) => {
    console.error(`problem with request: ${e.message}`);
    server.kill();
  });

  req.write(postData);
  req.end();
}
