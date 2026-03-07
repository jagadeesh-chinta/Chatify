import mongoose from 'mongoose';

/**
 * ChatKey Model - Stores BB84-generated shared keys between two users
 * Each pair of users has one shared key for encrypted communication
 */
const chatKeySchema = new mongoose.Schema(
  {
    user1Id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    user2Id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    sharedKey: {
      type: String,
      required: true,
      // SHA-256 keys are 64 hex characters
      validate: {
        validator: function (value) {
          return /^[a-f0-9]{64}$/.test(value);
        },
        message: 'Shared key must be a valid SHA-256 hash (64 hex characters)',
      },
    },
  },
  { timestamps: true }
);

/**
 * Index to prevent duplicate keys between the same two users
 * Ensures each pair of users has exactly one shared key
 * The index is compound and unique on both user IDs in sorted order
 */
chatKeySchema.index({ user1Id: 1, user2Id: 1 }, { unique: true });

/**
 * Middleware: Ensure user1Id < user2Id (string comparison) for consistent pair ordering
 * This prevents duplicate keys for the same pair (e.g., Alice-Bob and Bob-Alice)
 */
chatKeySchema.pre('save', async function (next) {
  if (!this.isNew) return next();
  
  // Sort user IDs to ensure consistent ordering
  const [id1, id2] = [this.user1Id.toString(), this.user2Id.toString()].sort();
  
  if (this.user1Id.toString() !== id1) {
    // Swap IDs if they're not in sorted order
    const temp = this.user1Id;
    this.user1Id = this.user2Id;
    this.user2Id = temp;
  }
  
  next();
});

/**
 * Static method: Find shared key between two users regardless of order
 * @param {ObjectId} userId1 - First user's ID
 * @param {ObjectId} userId2 - Second user's ID
 * @returns {Promise<Document|null>} - ChatKey document or null
 */
chatKeySchema.statics.findKeyByUserPair = async function (userId1, userId2) {
  const [id1, id2] = [userId1.toString(), userId2.toString()].sort();
  return this.findOne({
    user1Id: id1,
    user2Id: id2,
  });
};

/**
 * Static method: Create or find a shared key between two users
 * Prevents duplicate key creation if one already exists
 * @param {ObjectId} userId1 - First user's ID
 * @param {ObjectId} userId2 - Second user's ID
 * @param {String} sharedKey - The BB84-generated shared key
 * @returns {Promise<Document>} - ChatKey document (new or existing)
 */
chatKeySchema.statics.createOrFindKey = async function (userId1, userId2, sharedKey) {
  const [id1, id2] = [userId1.toString(), userId2.toString()].sort();
  
  // Try to find existing key
  const existingKey = await this.findOne({
    user1Id: id1,
    user2Id: id2,
  });
  
  if (existingKey) {
    console.log('ChatKey: Shared key already exists for this user pair');
    return existingKey;
  }
  
  // Create new key if doesn't exist
  return this.create({
    user1Id: id1,
    user2Id: id2,
    sharedKey,
  });
};

const ChatKey = mongoose.model('ChatKey', chatKeySchema);
export default ChatKey;
