import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Admin from '../models/Admin.js';
import User from '../models/User.js';
import Feedback from '../models/Feedback.js';
import { ENV } from '../lib/env.js';
import Message from '../models/Message.js'; // to get message stats if needed

export const setupAdmin = async (req, res) => {
    try {
        const adminCount = await Admin.countDocuments();
        if (adminCount > 0) {
            return res.status(403).json({ message: "Admin already exists. Cannot setup again." });
        }
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required" });
        }
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const admin = new Admin({ email, password: hashedPassword });
        await admin.save();
        res.status(201).json({ message: "Admin created successfully" });
    } catch (error) {
        console.error("Error in setupAdmin:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const loginAdmin = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required" });
        }

        const admin = await Admin.findOne({ email });
        if (!admin) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const isPasswordCorrect = await bcrypt.compare(password, admin.password);
        if (!isPasswordCorrect) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const token = jwt.sign({ adminId: admin._id }, ENV.JWT_SECRET, { expiresIn: "1d" });
        res.cookie("admin_jwt", token, {
            maxAge: 24 * 60 * 60 * 1000,
            httpOnly: true,
            sameSite: "lax",
            path: "/",
            secure: process.env.NODE_ENV === "development" ? false : true,
        });

        res.status(200).json({
            _id: admin._id,
            email: admin.email,
        });
    } catch (error) {
        console.error("Error in loginAdmin:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const logoutAdmin = (req, res) => {
    try {
        res.cookie("admin_jwt", "", { maxAge: 0 });
        res.status(200).json({ message: "Logged out successfully" });
    } catch (error) {
        console.error("Error in logoutAdmin:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const checkAdminAuth = (req, res) => {
    try {
        res.status(200).json(req.admin);
    } catch (error) {
        console.log("Error in checkAdminAuth:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const getAdminStats = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const totalMessages = await Message.countDocuments();
        // You can add more stats as needed
        res.status(200).json({
            totalUsers,
            totalMessages,
        });
    } catch (error) {
        console.error("Error in getAdminStats:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select("-password").sort({ createdAt: -1 });
        res.status(200).json(users);
    } catch (error) {
        console.error("Error in getAllUsers:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const banUser = async (req, res) => {
    try {
        const { id } = req.params;
        await User.findByIdAndUpdate(id, { isBanned: true });
        res.status(200).json({ message: "User banned successfully" });
    } catch (error) {
        console.error("Error in banUser:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const unbanUser = async (req, res) => {
    try {
        const { id } = req.params;
        await User.findByIdAndUpdate(id, { isBanned: false, banAppeal: null }); // clear appeal on unban
        res.status(200).json({ message: "User unbanned successfully" });
    } catch (error) {
        console.error("Error in unbanUser:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const getFeedbacks = async (req, res) => {
    try {
        const feedbacks = await Feedback.find()
            .populate('userId', 'fullName email profilePic')
            .sort({ createdAt: -1 });
        res.status(200).json(feedbacks);
    } catch (error) {
        console.error("Error in getFeedbacks:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};
