import {ENV} from '../lib/env.js';
import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import { generateToken } from '../lib/utils.js';
import cloudinary from '../lib/cloudinary.js';

const normalizeEmail = (value) => String(value || "").trim().toLowerCase();

export const signup = async (req,res)=>{
    const {fullName, email, password, phoneNumber} = req.body;
    try {
        if(!fullName || !email || !password){
            return res.status(400).json({message: "All fields are required"});
        }
        if(password.length < 6){
            return res.status(400).json({message: "Password must be at least 6 characters long"});
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if(!emailRegex.test(email)){
            return res.status(400).json({message: "Invalid email format"});
        }
        const user = await User.findOne({email});
        if(user){
            return res.status(400).json({message: "Email already exists"});
        }
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const newUser = new User({
            fullName,
            email,
            phoneNumber: phoneNumber || "",
            password: hashedPassword
        });
        if(newUser){
            const savedUser = await newUser.save();
            return res.status(201).json({
                success: true,
                message: "Account created successfully. Please log in.",
                _id: savedUser._id,
                fullName: savedUser.fullName,
                ehoneNumber: savedUser.phoneNumber,
                pmail: savedUser.email,
                profilePic: savedUser.profilePic,
                createdAt: savedUser.createdAt,
            });

        }
        else{
            return res.status(400).json({message: "Invalid user data"});
        }
    } 
    catch (error) {
        console.log("Error in signup controller:", error);
        res.status(500).json({message: "Internal server error"});
    }
};

export const login = async (req,res) => {
    const { email, password } = req.body;
    const normalizedEmail = normalizeEmail(email);

    // Debug login requests in production without logging secrets.
    console.log("[AUTH_LOGIN] request", {
        email: normalizedEmail || null,
        hasPassword: Boolean(password),
        origin: req.headers.origin || null,
        userAgent: req.headers["user-agent"] || null,
    });

    if(!normalizedEmail || !password)
    {
        return res.status(400).json({message: "Email and password are required"});
    }

    try {
        const user = await User.findOne({email: normalizedEmail});
        if(!user) {
            console.warn("[AUTH_LOGIN] user not found", { email: normalizedEmail });
            return res.status(400).json({message:"Invalid credentials"});
        }

        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        if(!isPasswordCorrect) {
            console.warn("[AUTH_LOGIN] invalid password", { email: normalizedEmail });
            return res.status(400).json({message:"Invalid credentials"});
        }

        generateToken(user._id, res);

        console.log("[AUTH_LOGIN] success", { userId: user._id.toString(), email: user.email });
        
        res.status(200).json({
            _id: user._id,
            fullName: user.fullName,
            email: user.email,
            profilePic: user.profilePic,
            createdAt: user.createdAt,
        });
    } 
    catch (error) {
        console.error("[AUTH_LOGIN] unexpected error", {
            email: normalizedEmail,
            message: error?.message,
            stack: error?.stack,
        });
        res.status(500).json({message: "Login failed. Please try again."});
    }
};

export const logout = (_,res) => {
    res.cookie("jwt","",{maxAge:0});
    res.status(200).json({message: "Logged out successfully"});
};

export const updateProfile = async (req,res) => {
    try {
        const {profilePic} = req.body;
        if(!profilePic) return res.status(400).json({message: "Profile picture is required"});

        const userId = req.user._id;
        const uploadResponse = await cloudinary.uploader.upload(profilePic);

        const updatedUser = await User.findByIdAndUpdate(userId, {profilePic: uploadResponse.secure_url}, {new: true});
        res.status(200).json(updatedUser);
    } 
    catch (error) {
        console.log("Error in updateProfile controller:", error);
        res.status(500).json({message: "Internal server error"});
    }
};
