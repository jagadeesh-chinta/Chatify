import mongoose from 'mongoose';

const chatPreferenceSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  otherUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  nickname: {
    type: String,
    default: '',
    trim: true,
    maxlength: 50,
  },
  notificationsEnabled: {
    type: Boolean,
    default: true,
  },
  readReceiptsEnabled: {
    type: Boolean,
    default: true,
  },
  backgroundImage: {
    type: String,
    default: '',
  },
  textColor: {
    type: String,
    default: '',
  }
}, { timestamps: true });

// Ensure unique preferences per user pair per direction
chatPreferenceSchema.index({ user: 1, otherUser: 1 }, { unique: true });

const ChatPreference = mongoose.model('ChatPreference', chatPreferenceSchema);
export default ChatPreference;
