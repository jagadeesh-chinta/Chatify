import mongoose from 'mongoose';

const RESTORE_WINDOW_HOURS = 48;
const getExpiryDate = () => new Date(Date.now() + RESTORE_WINDOW_HOURS * 60 * 60 * 1000);

/**
 * DeletedChat Model - Stores soft-deleted chats for users
 * When a user deletes a chat, the reference is stored here
 * Messages remain in the database, only hidden from the user's view
 */
const deletedChatSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    deletedUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      default: getExpiryDate,
      index: true,
    },
  },
  { timestamps: true }
);

// Prevent duplicate entries for same user pair
deletedChatSchema.index({ userId: 1, deletedUserId: 1 }, { unique: true });

/**
 * Static method: Check if a chat is deleted for a user
 */
deletedChatSchema.statics.isChatDeleted = async function (userId, otherUserId) {
  const deleted = await this.findOne({ userId, deletedUserId: otherUserId });
  return !!deleted;
};

/**
 * Static method: Get all deleted chats for a user
 */
deletedChatSchema.statics.getDeletedChatsForUser = async function (userId) {
  return this.find({ userId }).populate('deletedUserId', 'fullName profilePic');
};

/**
 * Static method: Soft delete a chat (add to deleted list)
 */
deletedChatSchema.statics.softDeleteChat = async function (userId, deletedUserId) {
  try {
    return await this.create({ userId, deletedUserId, expiresAt: getExpiryDate() });
  } catch (error) {
    if (error.code === 11000) {
      // Already deleted: reset expiry window from now
      return this.findOneAndUpdate(
        { userId, deletedUserId },
        { $set: { expiresAt: getExpiryDate() } },
        { new: true }
      );
    }
    throw error;
  }
};

/**
 * Static method: Restore a chat (remove from deleted list)
 */
deletedChatSchema.statics.restoreChat = async function (userId, deletedUserId) {
  return this.findOneAndDelete({ userId, deletedUserId });
};

const DeletedChat = mongoose.model('DeletedChat', deletedChatSchema);
export default DeletedChat;
