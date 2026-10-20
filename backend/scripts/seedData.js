import 'dotenv/config';
import mongoose from 'mongoose';
import { connectDB } from '../config/db.js';
import Chat from '../models/Chat.js';
import { DEFAULT_PAST_CHATS } from '../controllers/chatController.js';

const seedDatabase = async () => {
  try {
    console.log('🌱 Connecting to MongoDB to seed past conversations...');
    await connectDB();

    console.log('🧹 Clearing existing chats (if any)...');
    await Chat.deleteMany({});

    console.log(`📥 Inserting ${DEFAULT_PAST_CHATS.length} past conversation sessions into MongoDB...`);
    const inserted = await Chat.insertMany(DEFAULT_PAST_CHATS);

    console.log(`🎉 Successfully seeded ${inserted.length} past chat sessions into MongoDB!`);
    inserted.forEach((chat, index) => {
      console.log(`   ${index + 1}. [${chat.model}] "${chat.title}" (${chat.messages.length} messages)`);
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Error during database seeding:', error);
    process.exit(1);
  }
};

seedDatabase();
