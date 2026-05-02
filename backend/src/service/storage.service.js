import multer from 'multer';


const storage = multer.memoryStorage();


const imageFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Only image files are allowed!'), false);
    }
};

/**
 * Limits: 1MB file size
 */
export const upload = multer({
    storage: storage,
    limits: { fileSize: 1 * 1024 * 1024 },
    fileFilter: imageFilter
});

// Helper for specific single photo uploads
export const uploadSinglePhoto = upload.single('photo');