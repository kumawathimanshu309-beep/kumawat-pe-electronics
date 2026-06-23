

async function run() {
  console.log('Sending login POST request...');
  const res = await fetch('http://localhost:3000/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      username: 'kumawathimanshu309@gmail.com',
      password: 'HIMANSHU@2005'
    }),
    redirect: 'manual'
  });
  
  console.log('Status:', res.status);
  res.headers.forEach((value, name) => console.log(name, value));
  
  // Now try to access the admin page using the cookie
  const setCookie = res.headers.get('set-cookie');
  if (setCookie) {
    const cookieString = setCookie.split(';')[0];
    console.log('Got cookie:', cookieString);
    console.log('Accessing /admin...');
    const adminRes = await fetch('http://localhost:3000/admin', {
      headers: { 'Cookie': cookieString },
      redirect: 'manual'
    });
    console.log('Admin Status:', adminRes.status);
    console.log('Admin Location:', adminRes.headers.get('location'));
  } else {
    console.log('NO COOKIE RETURNED!');
  }
}
run().catch(console.error);
