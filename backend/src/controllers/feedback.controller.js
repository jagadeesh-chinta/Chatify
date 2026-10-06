import Feedback from "../models/Feedback.js";

export const submitFeedback = async (req, res) => {
    try {
        const { message } = req.body;
        const userId = req.user._id;

        if (!message) {
            return res.status(400).json({ message: "Feedback message is required" });
        }

        const newFeedback = new Feedback({
            userId,
            message
        });

        await newFeedback.save();

        res.status(201).json({ message: "Feedback submitted successfully" });
    } catch (error) {
        console.error("Error in submitFeedback:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};
