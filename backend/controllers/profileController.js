const User = require('../models/User');
const imagekit = require('../utils/imagekit');
const multer = require('multer');

// Configure Multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({ 
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed!'), false);
        }
    }
}).single('photo');

exports.updatePhoto = (req, res) => {
    upload(req, res, async (err) => {
        if (err) {
            return res.status(400).json({ message: err.message });
        }
        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded" });
        }

        try {
            const base64File = req.file.buffer.toString('base64');
            const result = await imagekit.files.upload({
                file: base64File,
                fileName: `profile-${req.user._id}-${Date.now()}`,
                folder: "/profile-photos"
            });

            const user = await User.findByIdAndUpdate(
                req.user._id,
                { profilePhoto: result.url },
                { new: true }
            );

            res.json({
                success: true,
                profilePhoto: user.profilePhoto,
                message: "Profile photo updated successfully"
            });
        } catch (error) {
            console.error("Profile Photo Upload Error:", error);
            res.status(500).json({ message: "Failed to upload photo" });
        }
    });
};

exports.changePassword = async (req, res) => {
    const { currentPassword, newPassword } = req.body;

    try {
        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Verify current password
        const isMatch = await user.comparePassword(currentPassword);
        if (!isMatch) {
            return res.status(400).json({ message: "Current password is incorrect" });
        }

        // Update password (pre-save hook will handle hashing)
        user.password = newPassword;
        await user.save();

        res.json({
            success: true,
            message: "Password updated successfully"
        });
    } catch (error) {
        console.error("Change Password Error:", error);
        res.status(500).json({ message: "Failed to update password" });
    }
};
