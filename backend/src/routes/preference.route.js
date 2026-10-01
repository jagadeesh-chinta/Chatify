import express from 'express';
import multer from 'multer';
import { getPreference, updatePreference, uploadBackgroundImage } from '../controllers/preference.controller.js';
import { protectRoute } from '../middleware/auth.middleware.js';
import { arcjetProtection } from '../middleware/arcjet.middleware.js';

const router = express.Router();
router.use(arcjetProtection, protectRoute);

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } }); // 10MB limit

router.get('/:otherUserId', getPreference);
router.put('/:otherUserId', updatePreference);
router.post('/:otherUserId/background', upload.single('file'), uploadBackgroundImage);

export default router;
