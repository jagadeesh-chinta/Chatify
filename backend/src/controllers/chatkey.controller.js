import bcrypt from "bcryptjs";
import User from "../models/User.js";

/**
 * Get ChatKey password status for the logged-in user
 * Returns whether the user has set a ChatKey password
 */
export const getChatKeyStatus = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId).select("isChatKeyPasswordSet");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      isChatKeyPasswordSet: user.isChatKeyPasswordSet || false,
    });
  } catch (error) {
    console.error("getChatKeyStatus error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * Set ChatKey password for the first time
 * Validates password and confirm password, hashes and stores securely
 */
export const setChatKeyPassword = async (req, res) => {
  try {
    const userId = req.user._id;
    const { password, confirmPassword } = req.body;

    // Validation
    if (!password || !confirmPassword) {
      return res.status(400).json({ message: "Password and confirm password are required" });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    // Check if password is already set
    const user = await User.findById(userId).select("+chatKeyPassword isChatKeyPasswordSet");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.isChatKeyPasswordSet) {
      return res.status(400).json({ message: "ChatKey password is already set" });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Update user with hashed password
    user.chatKeyPassword = hashedPassword;
    user.isChatKeyPasswordSet = true;
    await user.save();

    res.status(200).json({
      message: "ChatKey password set successfully",
      isChatKeyPasswordSet: true,
    });
  } catch (error) {
    console.error("setChatKeyPassword error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * Verify ChatKey password
 * Compares entered password with stored hash
 */
export const verifyChatKeyPassword = async (req, res) => {
  try {
    const userId = req.user._id;
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ message: "Password is required" });
    }

    // Get user with chatKeyPassword field
    const user = await User.findById(userId).select("+chatKeyPassword isChatKeyPasswordSet");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!user.isChatKeyPasswordSet || !user.chatKeyPassword) {
      return res.status(400).json({ message: "ChatKey password not set" });
    }

    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.chatKeyPassword);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid Credentials" });
    }

    res.status(200).json({
      message: "Password verified successfully",
      verified: true,
    });
  } catch (error) {
    console.error("verifyChatKeyPassword error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * Change ChatKey password
 * Validates current password and updates with new hashed password
 */
export const changeChatKeyPassword = async (req, res) => {
  try {
    const userId = req.user._id;
    const { currentPassword, newPassword, confirmPassword } = req.body;

    // Validation: All fields required
    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Validation: New password minimum 6 characters
    if (newPassword.length < 6) {
      return res.status(400).json({ message: "New password must be at least 6 characters" });
    }

    // Validation: Confirm password matches
    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: "New password and confirm password do not match" });
    }

    // Get user with chatKeyPassword field
    const user = await User.findById(userId).select("+chatKeyPassword isChatKeyPasswordSet");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if ChatKey password is set
    if (!user.isChatKeyPasswordSet || !user.chatKeyPassword) {
      return res.status(400).json({ message: "ChatKey password not set. Please set it first." });
    }

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.chatKeyPassword);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid current password" });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update chatKeyPassword
    user.chatKeyPassword = hashedPassword;
    await user.save();

    res.status(200).json({ message: "ChatKey password changed successfully" });
  } catch (error) {
    console.error("changeChatKeyPassword error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
