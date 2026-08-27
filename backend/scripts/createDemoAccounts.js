// One-off script: creates (or updates) two demo accounts with an EXPIRED
// subscription, for Apple App Review's "demo account" requirement.
// Usage: MONGODB_URI="<your connection string>" node backend/scripts/createDemoAccounts.js
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../src/models/User');
const Maid = require('../src/models/Maid');
const { HouseWife } = require('../src/models/index');

const MAID_EMAIL = 'demo.maid@servix.world';
const MAID_PASSWORD = 'DemoMaid2026!';
const CUSTOMER_EMAIL = 'demo.customer@servix.world';
const CUSTOMER_PASSWORD = 'DemoCustomer2026!';

const past = (days) => new Date(Date.now() - days * 24 * 60 * 60 * 1000);

async function upsertUser({ role, name, email, password }) {
  let user = await User.findOne({ email });
  if (!user) {
    user = new User({ role, name, email, password, emailVerified: true, isVerified: true, isActive: true });
  } else {
    user.password = password;
    user.emailVerified = true;
    user.isVerified = true;
    user.isActive = true;
    user.isSuspended = false;
  }
  await user.save(); // pre-save hook hashes password
  return user;
}

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB');

  // ── Demo Maid (expired subscription) ──
  const maidUser = await upsertUser({ role: 'maid', name: 'Demo Maid', email: MAID_EMAIL, password: MAID_PASSWORD });
  await Maid.findOneAndUpdate(
    { user: maidUser._id },
    {
      $set: {
        user: maidUser._id,
        fullName: 'Demo Maid',
        age: 30,
        nationality: 'Egypt',
        origin: 'egyptian',
        experienceYears: 5,
        expectedSalary: 17500,
        skills: ['Cleaning', 'Cooking'],
        bio: 'Demo account for App Store review.',
        isAvailable: true,
        isHired: false,
        subscription: { plan: 'monthly', status: 'expired', startDate: past(60), endDate: past(30) },
        verificationStatus: 'verified',
        approvalStatus: 'approved',
      },
    },
    { upsert: true, new: true }
  );
  console.log(`Demo maid ready: ${MAID_EMAIL} / ${MAID_PASSWORD}`);

  // ── Demo Customer / Housewife (expired subscription) ──
  const hwUser = await upsertUser({ role: 'housewife', name: 'Demo Customer', email: CUSTOMER_EMAIL, password: CUSTOMER_PASSWORD });
  await HouseWife.findOneAndUpdate(
    { user: hwUser._id },
    {
      $set: {
        user: hwUser._id,
        fullName: 'Demo Customer',
        country: 'Egypt',
        city: 'Cairo',
        residentialArea: 'Maadi',
        subscription: { status: 'expired', startDate: past(60), endDate: past(30) },
      },
    },
    { upsert: true, new: true }
  );
  console.log(`Demo customer ready: ${CUSTOMER_EMAIL} / ${CUSTOMER_PASSWORD}`);

  await mongoose.disconnect();
  console.log('Done.');
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
