import path from "path";
import multer from "multer";
const MAX_VIDEO_SIZE_BYTES = 50 * 1024 * 1024;
const MAX_AUDIO_PDF_SIZE_BYTES = 100 * 1024 * 1024;
const DOCUMENT_MIME_TYPES = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "text/plain",
  "text/csv",
  "application/rtf",
  "application/vnd.oasis.opendocument.text",
  "application/vnd.oasis.opendocument.spreadsheet",
  "application/vnd.oasis.opendocument.presentation",
]);
const DOCUMENT_EXTENSIONS = new Set([
  ".pdf",
  ".doc",
  ".docx",
  ".ppt",
  ".pptx",
  ".xls",
  ".xlsx",
  ".txt",
  ".csv",
  ".rtf",
  ".odt",
  ".ods",
  ".odp",
]);

const isMp4File = (file) => file?.mimetype === "video/mp4";
const isMp3File = (file) => file?.mimetype === "audio/mpeg" || file?.mimetype === "audio/mp3";

const isDocumentFile = (file) => {
  if (!file) return false;
  const extension = path.extname(file.originalname || "").toLowerCase();
  const byMime = DOCUMENT_MIME_TYPES.has(file.mimetype);
  const byExtension = DOCUMENT_EXTENSIONS.has(extension);
  return byMime || byExtension;
};

const getUploadCategory = (file) => {
  if (isMp4File(file)) return "video";
  if (isMp3File(file)) return "audio";
  if (isDocumentFile(file)) return "document";
  return null;
};

const storage = multer.memoryStorage();

const fileFilter = (_, file, cb) => {
  if (!getUploadCategory(file)) {
    return cb(new Error("Invalid file type. Only MP4, MP3, and document files are allowed"));
  }

  cb(null, true);
};

const getMediaSizeValidationError = (file) => {
  if (!file) return null;

  if (isMp4File(file) && file.size > MAX_VIDEO_SIZE_BYTES) {
    return "Video size must be less than 50MB";
  }

  if ((isMp3File(file) || isDocumentFile(file)) && file.size > MAX_AUDIO_PDF_SIZE_BYTES) {
    return "Audio/Document size must be less than 100MB";
  }

  return null;
};

export const validateMediaFileSize = (req, res, next) => {
  if (!req.file) return next();

  const validationError = getMediaSizeValidationError(req.file);
  if (!validationError) return next();

  return res.status(400).json({ message: validationError });
};

export const uploadMedia = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 100 * 1024 * 1024,
  },
});
