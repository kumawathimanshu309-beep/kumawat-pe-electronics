const http = require('http');

async function testLogin() {
  console.log("--- 1. POST /auth/login ---");
  const postData = JSON.stringify({
    username: 'kumawathimanshu309@gmail.com',
    password: 'HIMANSHU@2005'
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
      return;
    }
    
    console.log(`✅ Set-Cookie received: ${setCookie}`);
    
    const location = res.headers['location'];
    console.log(`Redirect Location: ${location}`);

    if (location && setCookie) {
      console.log(`\n--- 2. GET ${location} ---`);
      // Parse the cookie to send back
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
        
        let body = '';
        getRes.on('data', chunk => body += chunk);
        getRes.on('end', () => {
          if (getRes.statusCode === 302 && getRes.headers['location'] === '/login') {
            console.log("❌ ERROR: Redirected back to /login! Session was not recognized by isAuthenticated.");
          } else if (getRes.statusCode === 200) {
            console.log("✅ SUCCESS: Accessed protected route successfully.");
          } else {
            console.log(`UNKNOWN RESULT: Status ${getRes.statusCode}`);
          }
        });
      });
      getReq.end();
    }
  });

  req.on('error', (e) => {
    console.error(`problem with request: ${e.message}`);
  });

  req.write(postData);
  req.end();
}

testLogin();
