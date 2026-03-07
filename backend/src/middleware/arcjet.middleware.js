import aj from "../lib/arcjet.js";
import { isSpoofedBot } from "@arcjet/inspect";

export const arcjetProtection = async (req,res,next) => {
    try {
        const decision = await aj.protect(req);
        if(decision.isDenied()){
            if(decision.reason.isRateLimit()){
                return res.status(429).json({message: "Too many requests. Please try again later."});
            }
    }

    //check for spoofed bots
    if(decision.results.some(isSpoofedBot)){
        return res.status(403).json({message: "Malicious bot activity detected", error:"Spoofed bot detected",});
    }
    next();
    } 
    catch (error) {
        console.error("Arcjet protection error:", error);
        next();
    }
}