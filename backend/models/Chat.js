import mongoose from 'mongoose';

const MessageSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['user', 'model', 'assistant', 'system'],
    required: true,
  },
  text: {
    type: String,
    default: '',
  },
  image: {
    data: { type: String, default: null },
    mimeType: { type: String, default: null },
    name: { type: String, default: null },
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
}, { _id: false });

const ChatSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    title: {
      type: String,
      default: 'New Chat',
      trim: true,
    },
    model: {
      type: String,
      default: 'gemini-3.8-flash',
    },
    systemInstruction: {
      type: String,
      default: '',
    },
    messages: [MessageSchema],
  },
  {
    timestamps: true, // Automatically manages createdAt and updatedAt
  }
);

export const Chat = mongoose.model('Chat', ChatSchema);
export default Chat;
