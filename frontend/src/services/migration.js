import { syncPastChatsToMongo } from './api';

/**
 * Automatically migrate past localStorage chat history to MongoDB
 */
export async function autoMigrateLocalStorageChats() {
  try {
    const raw = localStorage.getItem('gemini_chats');
    if (!raw) return { migrated: false };

    const parsed = JSON.parse(raw);
    const chats = Object.values(parsed);

    if (chats.length > 0) {
      console.log(`🔄 Migrating ${chats.length} past chats from localStorage to MongoDB...`);
      await syncPastChatsToMongo(chats);
      console.log('✅ Past chat data successfully migrated to MongoDB!');
      return { migrated: true, count: chats.length };
    }
  } catch (err) {
    console.warn('Could not auto-migrate localStorage past chats:', err);
  }
  return { migrated: false };
}
