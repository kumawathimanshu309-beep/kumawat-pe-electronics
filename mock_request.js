const express = require('express');
const session = require('express-session');
const passport = require('passport');

const app = express();
app.set('trust proxy', 1);

app.use(session({
  secret: 'test',
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 24 * 60 * 60 * 1000,
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'lax'
  }
}));

app.use(passport.initialize());
app.use(passport.session());

app.get('/test', (req, res) => {
  try {
    console.log("req.session:", req.session);
    req.session.user = { id: 1 };
    res.send("Success");
  } catch (err) {
    console.error("Crash:", err.message);
    res.status(500).send("Error");
  }
});

app.listen(3002, () => {
  console.log("Listening");
  fetch('http://localhost:3002/test').then(r => r.text()).then(t => {
    console.log("Response:", t);
    process.exit(0);
  });
});
