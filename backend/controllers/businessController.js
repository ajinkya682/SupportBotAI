const Business = require('../models/Business');
const crypto = require('crypto');
const cache = require('../utils/cache');
const { scrapeWebsite } = require('../utils/scraper');
const imagekit = require('../utils/imagekit');
const multer = require('multer');

// Configure Multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({ 
    storage: storage,
    limits: { fileSize: 1 * 1024 * 1024 }, // 1MB limit
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed!'), false);
        }
    }
}).single('logo');

exports.uploadLogo = (req, res) => {
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
                file: base64File, // base64 string
                fileName: `logo-${Date.now()}`, // required
                folder: "/business-logos"
            });

            res.json({
                success: true,
                url: result.url
            });
        } catch (error) {
            console.error("ImageKit Upload Error:", error);
            res.status(500).json({ message: "Failed to upload to ImageKit" });
        }
    });
};

exports.getBusiness = async (req, res, next) => {
    try {
        const ownerId = req.user.role === 'agent' ? req.user.ownerId : req.user._id;
        
        // Find existing business
        let business = await Business.findOne({ owner: ownerId });

        // If not found and user is an owner/admin, create it
        if (!business && (req.user.role === 'owner' || req.user.role === 'admin')) {
            try {
                business = await Business.create({
                    owner: ownerId,
                    name: req.user.name ? `${req.user.name}'s Business` : 'My Support Node',
                    plan: 'free',
                    allowedDomains: []
                });
            } catch (createErr) {
                // Handle potential race condition if another request created it simultaneously
                business = await Business.findOne({ owner: ownerId });
                if (!business) throw createErr;
            }
        }

        if (!business) {
            return res.status(404).json({ message: 'Business node not found. Please contact support.' });
        }

        // Ensure apiKey exists (redundant but safe)
        if (!business.apiKey) {
            business.apiKey = `sb_${crypto.randomBytes(16).toString('hex')}`;
            await business.save();
        }

        res.json(business);
    } catch (error) {
        console.error(`[getBusiness] Error:`, error);
        res.status(500).json({ 
            message: 'Failed to sync business node', 
            error: error.message 
        });
    }
};

exports.updateBusiness = async (req, res) => {
    const { name, supportEmail, knowledge, faqs, appearance } = req.body;
    try {
        // Find current business to check if botName has been customized
        const current = await Business.findOne({ owner: req.user._id });
        
        // Build the appearance update
        let appearanceUpdate = appearance || {};
        
        // Auto-sync botName: if botName matches old business name (not customized),
        // update it to match the new business name
        if (name && current) {
            const currentBotName = current.appearance?.botName;
            const wasDefault = !currentBotName || currentBotName === current.name;
            if (wasDefault) {
                appearanceUpdate = { ...appearanceUpdate, botName: name };
            }
        }

        const business = await Business.findOneAndUpdate(
            { owner: req.user._id },
            { name, supportEmail, knowledge, faqs, appearance: appearanceUpdate },
            { new: true }
        );
        if (business) cache.del(business.apiKey);
        res.json(business);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getNotifications = async (req, res) => {
    try {
        const business = await Business.findOne({ owner: req.user._id });
        res.json(business.notifications || []);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.markNotificationsRead = async (req, res) => {
    try {
        await Business.findOneAndUpdate(
            { owner: req.user._id },
            { $set: { "notifications.$[].isRead": true } }
        );
        res.json({ message: "Notifications cleared" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.upgradePlan = async (req, res) => {
    try {
        const business = await Business.findOneAndUpdate(
            { owner: req.user._id },
            { 
                plan: 'pro',
                conversationLimit: 999999
            },
            { new: true }
        );
        if (business) cache.del(business.apiKey);
        res.json({ success: true, business });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.scrapeAndTrain = async (req, res) => {
    let { url } = req.body;
    const ownerId = req.user.role === 'agent' ? req.user.ownerId : req.user._id;
    const businessCheck = await Business.findOne({ owner: ownerId });

    if (businessCheck && businessCheck.plan === 'free') {
        return res.status(403).json({ 
            message: "Website scanning is a Pro feature.",
            isPlanRestricted: true 
        });
    }

    if (!url || url.trim() === "") {
        return res.status(400).json({ message: "URL is required" });
    }

    // Sanitize and validate URL
    url = url.trim();
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = 'https://' + url;
    }

    try {
        new URL(url);
    } catch (e) {
        return res.status(400).json({ message: "Invalid URL format. Please enter a valid website address." });
    }

    // Enforcement of 180s timeout (increased for deep JS scans)
    const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Scraping timed out after 180 seconds. The website might be too complex or slow for a full scan.")), 180000)
    );

    try {
        const scrapePromise = scrapeWebsite(url);
        const result = await Promise.race([scrapePromise, timeoutPromise]);

        if (!result.knowledge || result.knowledge.length < 100) {
            return res.status(400).json({ 
                message: "We couldn't extract enough meaningful content from this website. Please ensure it's public and contains text." 
            });
        }

        // Use req.user.businessId if available, otherwise find by owner
        const businessId = req.user.businessId || req.user._id;
        const query = req.user.businessId ? { _id: businessId } : { owner: req.user._id };

        const business = await Business.findOneAndUpdate(
            query,
            { 
                knowledge: result.knowledge,
                lastTrainedAt: new Date(),
                trainedFromUrl: url,
                trainedPagesCount: result.pagesScanned
            },
            { new: true }
        );

        if (business) cache.del(business.apiKey);

        res.json({
            success: true,
            pagesScanned: result.pagesScanned,
            totalChars: result.totalChars,
            pagesList: result.pagesList,
            business
        });
    } catch (error) {
        console.error('Scraping error:', error);
        res.status(error.message.includes("timed out") ? 504 : 500).json({ 
            message: error.message || "An unexpected error occurred during the scan." 
        });
    }
};
