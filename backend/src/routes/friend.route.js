import express from 'express';
import { sendFriendRequest, getIncomingRequests, acceptRequest, rejectRequest, getFriendStatus, toggleFavourite, getFavourites, isFavourite, getFriendsList, removeFriend, getOtherUserProfile } from '../controllers/friend.controller.js';
import { protectRoute } from '../middleware/auth.middleware.js';
import { arcjetProtection } from '../middleware/arcjet.middleware.js';

const router = express.Router();
router.use(arcjetProtection, protectRoute);

router.post('/request/:receiverId', sendFriendRequest);
router.get('/requests', getIncomingRequests);
router.post('/requests/:id/accept', acceptRequest);
router.post('/requests/:id/reject', rejectRequest);
router.get('/status/:otherUserId', getFriendStatus);
router.get('/list', getFriendsList); // Get all friends of logged-in user
router.post('/favourite/:userId', toggleFavourite);
router.get('/favourite/:userId', isFavourite);
router.get('/list/favourites', getFavourites);
router.delete('/remove/:userId', removeFriend); // Remove friend
router.get('/profile/:userId', getOtherUserProfile); // View other user's profile

export default router;

// Compatibility routes following alternate naming from client requests
router.post('/friend-request', sendFriendRequest); // body: { receiverId }
router.get('/friend-requests', getIncomingRequests);
router.post('/friend-request/accept', acceptRequest); // body: { requestId }
router.post('/friend-request/reject', rejectRequest); // body: { requestId }
