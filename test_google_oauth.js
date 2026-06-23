const mongoose = require('mongoose');
const User = require('./models/User');

async function testGoogleStrategy() {
  // Connect to mongo
  await mongoose.connect('mongodb://localhost:27017/kumawat', {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });

  const profile = {
    id: '1234567890',
    displayName: 'Test User',
    emails: [{ value: 'testgoogle@example.com' }],
    photos: [{ value: 'http://example.com/photo.jpg' }]
  };

  const cb = (err, user) => {
    if (err) {
      console.error("Strategy Callback Error:", err);
    } else {
      console.log("Strategy Callback Success. User:", user.email);
    }
  };

  try {
      const email = profile.emails?.[0]?.value?.toLowerCase();
      if (!email) return cb(new Error("Google_Email_Missing"), null);
      
      let user = await User.findOne({ email });
      if (!user) {
        const newUserId = 'USER' + String(Date.now()).slice(-6) + Math.floor(Math.random() * 1000);
        const uniqueMobile = `GOOGLE_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
        const newUserObj = {
          userId: newUserId,
          name: profile.displayName || 'Google User',
          email: email,
          mobile: uniqueMobile,
          profilePhoto: profile.photos && profile.photos[0] ? profile.photos[0].value : '',
          googleId: profile.id,
          role: 'user',
          createdAt: new Date(),
          lastLoginAt: new Date(),
          activities: [{ action: 'Registered via Google OAuth', timestamp: new Date() }]
        };
        user = new User(newUserObj);
        await user.save();
      }
      return cb(null, user);
  } catch (err) {
    console.error("Caught Strategy Error:", err);
  } finally {
    await mongoose.disconnect();
  }
}

testGoogleStrategy().catch(console.error);
