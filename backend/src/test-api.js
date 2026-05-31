/**
 * Script test tổng hợp toàn bộ API
 * Chạy: node src/test-api.js
 */
const http = require('http');

const BASE = 'http://localhost:5000/api';

function request(method, path, body, token) {
  return new Promise((resolve, reject) => {
    const url = new URL(BASE + path);
    const data = body ? JSON.stringify(body) : null;
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname,
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(data ? { 'Content-Length': Buffer.byteLength(data) } : {}),
      },
    };
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        try { resolve({ status: res.statusCode, data: JSON.parse(body) }); }
        catch { resolve({ status: res.statusCode, data: body }); }
      });
    });
    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

async function runTests() {
  console.log('='.repeat(60));
  console.log('  TEST TỔNG HỢP API - Prompt 2');
  console.log('='.repeat(60));

  // ============================================
  // TEST 1: Register User A
  // ============================================
  console.log('\n📝 TEST 1: POST /api/users/register (User A)');
  const regA = await request('POST', '/users/register', {
    username: 'nguyenvana',
    email: 'nguyenvana@gmail.com',
    password: '123456',
    profile: { fullName: 'Nguyen Van A', bio: 'Yeu the thao va am nhac' },
    entertainmentPreferences: {
      categories: ['gaming', 'sports', 'music'],
      tags: ['MOBA', 'bong da', 'rock', 'guitar'],
      skillLevel: 'intermediate',
      preferredTime: 'evening',
    },
  });
  console.log(`   Status: ${regA.status} | Success: ${regA.data.success}`);
  console.log(`   User: ${regA.data.data.user.username} | Email: ${regA.data.data.user.email}`);
  console.log(`   Token: ${regA.data.data.token.substring(0, 30)}...`);
  const userAId = regA.data.data.user._id;
  const tokenA = regA.data.data.token;

  // ============================================
  // TEST 2: Register User B (similar interests)
  // ============================================
  console.log('\n📝 TEST 2: POST /api/users/register (User B - similar interests)');
  const regB = await request('POST', '/users/register', {
    username: 'tranvanb',
    email: 'tranvanb@gmail.com',
    password: '123456',
    profile: { fullName: 'Tran Van B', bio: 'Game thu chien' },
    entertainmentPreferences: {
      categories: ['gaming', 'music', 'technology'],
      tags: ['MOBA', 'FPS', 'EDM', 'rock'],
      skillLevel: 'advanced',
      preferredTime: 'evening',
    },
  });
  console.log(`   Status: ${regB.status} | Success: ${regB.data.success}`);
  console.log(`   User: ${regB.data.data.user.username}`);

  // ============================================
  // TEST 3: Register User C (different interests)
  // ============================================
  console.log('\n📝 TEST 3: POST /api/users/register (User C - different interests)');
  const regC = await request('POST', '/users/register', {
    username: 'lethic',
    email: 'lethic@gmail.com',
    password: '123456',
    profile: { fullName: 'Le Thi C', bio: 'Thich nau an va du lich' },
    entertainmentPreferences: {
      categories: ['cooking', 'travel', 'photography'],
      tags: ['nau an', 'du lich', 'chup hinh'],
      skillLevel: 'beginner',
      preferredTime: 'morning',
    },
  });
  console.log(`   Status: ${regC.status} | Success: ${regC.data.success}`);
  console.log(`   User: ${regC.data.data.user.username}`);

  // ============================================
  // TEST 4: Login User A
  // ============================================
  console.log('\n🔐 TEST 4: POST /api/users/login (User A)');
  const login = await request('POST', '/users/login', {
    email: 'nguyenvana@gmail.com',
    password: '123456',
  });
  console.log(`   Status: ${login.status} | Success: ${login.data.success}`);
  console.log(`   Message: ${login.data.message}`);
  console.log(`   Login count: ${login.data.data.user.loginCount}`);

  // ============================================
  // TEST 5: Login with wrong password
  // ============================================
  console.log('\n🔐 TEST 5: POST /api/users/login (wrong password)');
  const loginFail = await request('POST', '/users/login', {
    email: 'nguyenvana@gmail.com',
    password: 'wrongpassword',
  });
  console.log(`   Status: ${loginFail.status} | Success: ${loginFail.data.success}`);
  console.log(`   Message: ${loginFail.data.message}`);

  // ============================================
  // TEST 6: Create Event (as User A)
  // ============================================
  console.log('\n🎮 TEST 6: POST /api/events/create (as User A)');
  const event1 = await request('POST', '/events/create', {
    title: 'Giao luu bong da cuoi tuan',
    description: 'Cung choi bong da vao cuoi tuan. Moi trinh do deu welcome!',
    category: 'sports',
    tags: ['bong da', 'the thao', 'outdoor', 'giao luu'],
    schedule: {
      startDate: '2026-04-10T08:00:00Z',
      endDate: '2026-04-10T10:00:00Z',
    },
    location: { type: 'offline', venue: { name: 'San bong Thong Nhat', city: 'Ho Chi Minh' } },
    maxParticipants: 22,
  }, tokenA);
  console.log(`   Status: ${event1.status} | Success: ${event1.data.success}`);
  console.log(`   Event: ${event1.data.data.activity.title}`);
  console.log(`   Category: ${event1.data.data.activity.category}`);
  console.log(`   Participants: ${event1.data.data.activity.participants.length}`);

  // ============================================
  // TEST 7: Create Event 2 (gaming)
  // ============================================
  console.log('\n🎮 TEST 7: POST /api/events/create (Gaming event)');
  const event2 = await request('POST', '/events/create', {
    title: 'Giai dau MOBA - Lien Minh Huyen Thoai',
    description: 'Thi dau 5v5 ranked. Can trinh do tu Gold tro len.',
    category: 'gaming',
    tags: ['MOBA', 'lien minh', 'esports', 'gaming'],
    schedule: {
      startDate: '2026-04-12T19:00:00Z',
      endDate: '2026-04-12T22:00:00Z',
    },
    location: { type: 'online', onlineUrl: 'https://discord.gg/example', platform: 'discord' },
    maxParticipants: 50,
  }, tokenA);
  console.log(`   Status: ${event2.status} | Success: ${event2.data.success}`);
  console.log(`   Event: ${event2.data.data.activity.title}`);

  // ============================================
  // TEST 8: Create Event 3 (music)
  // ============================================
  console.log('\n🎵 TEST 8: POST /api/events/create (Music event)');
  const event3 = await request('POST', '/events/create', {
    title: 'Jam session - Acoustic Night',
    description: 'Dem nhac acoustic cho nhung ban yeu guitar va vocal.',
    category: 'music',
    tags: ['guitar', 'acoustic', 'rock', 'nhac song'],
    schedule: {
      startDate: '2026-04-15T20:00:00Z',
      endDate: '2026-04-15T23:00:00Z',
    },
    location: { type: 'offline', venue: { name: 'Cafe Acoustic', city: 'Ho Chi Minh' } },
    maxParticipants: 20,
  }, tokenA);
  console.log(`   Status: ${event3.status} | Success: ${event3.data.success}`);
  console.log(`   Event: ${event3.data.data.activity.title}`);

  // ============================================
  // TEST 9: Create without auth (should fail)
  // ============================================
  console.log('\n❌ TEST 9: POST /api/events/create (without auth)');
  const eventFail = await request('POST', '/events/create', {
    title: 'This should fail',
    description: 'No token',
    category: 'gaming',
    schedule: { startDate: '2026-04-20T08:00:00Z', endDate: '2026-04-20T10:00:00Z' },
    location: { type: 'online' },
    maxParticipants: 10,
  });
  console.log(`   Status: ${eventFail.status} | Success: ${eventFail.data.success}`);
  console.log(`   Message: ${eventFail.data.message}`);

  // ============================================
  // TEST 10: Recommendations for User A
  // ============================================
  console.log('\n🎯 TEST 10: GET /api/recommendations/:userId (User A)');
  const rec = await request('GET', `/recommendations/${userAId}`);
  console.log(`   Status: ${rec.status} | Success: ${rec.data.success}`);
  console.log(`   User interests: ${rec.data.data.userProfile.categories.join(', ')}`);
  console.log(`   User tags: ${rec.data.data.userProfile.tags.join(', ')}`);

  console.log(`\n   📋 Recommended Users (${rec.data.data.recommendedUsers.length}):`);
  rec.data.data.recommendedUsers.forEach((r, i) => {
    console.log(`      ${i + 1}. ${r.user.username} — Score: ${r.compatibilityScore}%`);
    console.log(`         Common tags: [${r.commonTags.join(', ')}]`);
    console.log(`         Reason: ${r.reason}`);
  });

  console.log(`\n   📋 Recommended Activities (${rec.data.data.recommendedActivities.length}):`);
  rec.data.data.recommendedActivities.forEach((r, i) => {
    console.log(`      ${i + 1}. "${r.activity.title}" — Score: ${r.compatibilityScore}%`);
    console.log(`         Common tags: [${r.commonTags.join(', ')}]`);
    console.log(`         Reason: ${r.reason}`);
  });

  // ============================================
  console.log('\n' + '='.repeat(60));
  console.log('  ✅ ALL TESTS COMPLETED');
  console.log('='.repeat(60));
  process.exit(0);
}

runTests().catch((err) => {
  console.error('Test failed:', err);
  process.exit(1);
});
