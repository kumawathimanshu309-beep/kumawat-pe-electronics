const http = require('http');

const loginData = new URLSearchParams({
  username: 'kumawathimanshu309@gmail.com',
  password: 'HIMANSHU@2005',
  rememberMe: 'false'
}).toString();

const loginReq = http.request('http://localhost:3000/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
    'Content-Length': Buffer.byteLength(loginData)
  }
}, (res) => {
  let loginDataStr = '';
  res.on('data', c => loginDataStr += c);
  res.on('end', () => {
    console.log("Login HTTP status:", res.statusCode);
    let cookie = res.headers['set-cookie'];
    if (cookie && res.statusCode === 302) {
      cookie = cookie[0].split(';')[0];
      console.log("Logged in, got cookie:", cookie);
      
      // Now get cart
      const cartReq = http.request('http://localhost:3000/api/cart', {
        method: 'GET',
        headers: {
          'Cookie': cookie
        }
      }, (cartRes) => {
        let data = '';
        cartRes.on('data', chunk => data += chunk);
        cartRes.on('end', () => {
          console.log("Cart Response status:", cartRes.statusCode);
          console.log("Cart Response:", data);
        });
      });
      cartReq.end();
    } else {
      console.log("Login failed or no cookie. Status:", res.statusCode);
    }
  });
});

loginReq.on('error', console.error);
loginReq.write(loginData);
loginReq.end();
