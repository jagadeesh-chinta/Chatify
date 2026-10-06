import jwt from "jsonwebtoken";
import Admin from "../models/Admin.js";
import { ENV } from "../lib/env.js";

export const protectAdminRoute = async (req, res, next) => {
    try {
        const token = req.cookies.admin_jwt;
        if (!token) {
            return res.status(401).json({ message: "Unauthorized, no token provided" });
        }
        const decoded = jwt.verify(token, ENV.JWT_SECRET);
        if (!decoded) return res.status(401).json({ message: "Unauthorized, invalid token" });

        const admin = await Admin.findById(decoded.adminId).select("-password");
        if (!admin) return res.status(404).json({ message: "Admin not found" });

        req.admin = admin;
        next();
    } catch (error) {
        console.log("Error in protectAdminRoute middleware:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};
