import ChatPreference from '../models/ChatPreference.js';
import cloudinary from '../lib/cloudinary.js';

export const getPreference = async (req, res) => {
  try {
    const userId = req.user._id;
    const { otherUserId } = req.params;

    let preference = await ChatPreference.findOne({ user: userId, otherUser: otherUserId });
    
    if (!preference) {
      preference = await ChatPreference.create({ user: userId, otherUser: otherUserId });
    }

    res.status(200).json(preference);
  } catch (error) {
    console.error("Error in getPreference:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updatePreference = async (req, res) => {
  try {
    const userId = req.user._id;
    const { otherUserId } = req.params;
    const updates = req.body;

    // Only allow specific fields
    const allowedUpdates = {};
    if (updates.nickname !== undefined) allowedUpdates.nickname = updates.nickname;
    if (updates.notificationsEnabled !== undefined) allowedUpdates.notificationsEnabled = updates.notificationsEnabled;
    if (updates.readReceiptsEnabled !== undefined) allowedUpdates.readReceiptsEnabled = updates.readReceiptsEnabled;
    if (updates.textColor !== undefined) allowedUpdates.textColor = updates.textColor;
    if (updates.backgroundImage !== undefined) allowedUpdates.backgroundImage = updates.backgroundImage;

    const preference = await ChatPreference.findOneAndUpdate(
      { user: userId, otherUser: otherUserId },
      { $set: allowedUpdates },
      { new: true, upsert: true }
    );

    res.status(200).json(preference);
  } catch (error) {
    console.error("Error in updatePreference:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const uploadBackgroundImage = async (req, res) => {
  try {
    const userId = req.user._id;
    const { otherUserId } = req.params;

    if (!req.file) {
      return res.status(400).json({ message: "Image is required" });
    }

    if (!req.file.mimetype.startsWith("image/")) {
      return res.status(400).json({ message: "File must be an image" });
    }

    // Convert buffer to dataURI
    const b64 = Buffer.from(req.file.buffer).toString("base64");
    const dataURI = `data:${req.file.mimetype};base64,${b64}`;

    // Upload to cloudinary
    const uploadResponse = await cloudinary.uploader.upload(dataURI, {
      folder: "chat_backgrounds",
    });

    const preference = await ChatPreference.findOneAndUpdate(
      { user: userId, otherUser: otherUserId },
      { $set: { backgroundImage: uploadResponse.secure_url } },
      { new: true, upsert: true }
    );

    res.status(200).json(preference);
  } catch (error) {
    console.error("Error in uploadBackgroundImage:", error.message);
    res.status(500).json({ message: "Failed to upload background image" });
  }
};
