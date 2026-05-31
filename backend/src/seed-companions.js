const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const { User } = require('./models');
const connectDB = require('./config/db');

const seedCompanions = async () => {
  try {
    await connectDB();

    const companions = [
      {
        username: 'lynx_gaming',
        email: 'lynx@example.com',
        password: 'password123',
        profile: {
          fullName: 'Linh Miêu (Lynx)',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=400&auto=format&fit=crop',
          bio: 'Chào mọi người, mình là Linh. Mình đã chơi game được 5 năm và rất thích kết bạn mới.',
          gender: 'female'
        },
        entertainmentPreferences: {
          categories: ['gaming', 'other'],
          tags: ['League of Legends', 'Valorant', 'Tâm sự']
        },
        companion: {
          isCompanion: true,
          pricePerHour: 100000,
          rating: 4.9,
          reviewCount: 128,
          services: ['gaming', 'chat'],
          status: 'online'
        }
      },
      {
        username: 'bach_singer',
        email: 'bach@example.com',
        password: 'password123',
        profile: {
          fullName: 'Hoàng Bách',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=400&auto=format&fit=crop',
          bio: 'Nếu bạn cần một giọng ca để cùng song ca karaoke online hoặc đơn giản là muốn nghe guitar acoustic.',
          gender: 'male'
        },
        entertainmentPreferences: {
          categories: ['music', 'other'],
          tags: ['Hát hay', 'Guitar', 'Hài hước']
        },
        companion: {
          isCompanion: true,
          pricePerHour: 150000,
          rating: 4.8,
          reviewCount: 85,
          services: ['karaoke', 'chat'],
          status: 'online'
        }
      },
      {
        username: 'mina_chan',
        email: 'mina@example.com',
        password: 'password123',
        profile: {
          fullName: 'Mina Chan',
          avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=400&auto=format&fit=crop',
          bio: 'Mình là một cosplayer và gamer. Thích xem anime và chơi các game indie.',
          gender: 'female'
        },
        entertainmentPreferences: {
          categories: ['gaming', 'movies'],
          tags: ['Genshin Impact', 'Anime', 'Cosplay']
        },
        companion: {
          isCompanion: true,
          pricePerHour: 120000,
          rating: 4.7,
          reviewCount: 45,
          services: ['gaming', 'chat'],
          status: 'online'
        }
      }
    ];

    for (const c of companions) {
      const exists = await User.findOne({ username: c.username });
      if (!exists) {
        await User.create(c);
        console.log(`✅ Created companion: ${c.username}`);
      } else {
        exists.companion = c.companion;
        await exists.save();
        console.log(`🆙 Updated companion: ${c.username}`);
      }
    }

    console.log('✨ Seeding finished!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
};

seedCompanions();
