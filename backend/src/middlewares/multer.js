import multer from 'multer';
import path from 'path';

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Specify the folder where files will be uploaded
    cb(null, 'public');
  },
  filename: (req, file, cb) => {
    // Generate a unique file name using timestamp + original name
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const extension = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + extension);
  }
});

export const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 } // Optional limit (e.g., 5MB)
});