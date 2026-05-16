const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const ADMIN_EMAIL    = 'admin@maidconnect.com';
const NEW_PASSWORD   = 'Admin@1234';
const MONGO_URI      = 'mongodb+srv://servixadmin:EOdPRnLXKWqx07qj@cluster0.fxqauy3.mongodb.net/maidconnect';

async function run() {
  console.log('Connecting to MongoDB...');
  await mongoose.connect(MONGO_URI);
  console.log('Connected.');

  const User = require('./src/models/User');

  const hashed = await bcrypt.hash(NEW_PASSWORD, 12);

  let admin = await User.findOne({ email: ADMIN_EMAIL });

  if (admin) {
    // Use direct collection update to bypass the pre-save hook (avoids double hashing)
    await User.collection.updateOne(
      { email: ADMIN_EMAIL },
      { $set: { password: hashed, role: 'admin', isActive: true, isSuspended: false } }
    );
    console.log('\n✅ Admin password updated!');
  } else {
    await User.collection.insertOne({
      name: 'Admin',
      email: ADMIN_EMAIL,
      password: hashed,
      role: 'admin',
      isVerified: true,
      isActive: true,
      isSuspended: false,
      authProvider: 'local',
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSeen: new Date(),
    });
    console.log('\n✅ Admin account created!');
  }

  console.log('   Email:   ', ADMIN_EMAIL);
  console.log('   Password:', NEW_PASSWORD);
  console.log('\nYou can now log in to the admin panel.\n');

  await mongoose.disconnect();
}

run().catch(err => {
  console.error('\n❌ Error:', err.message);
  process.exit(1);
});
