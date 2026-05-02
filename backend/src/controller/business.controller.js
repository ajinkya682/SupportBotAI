import Business from '../models/business.model.js';
import crypto from 'crypto';
import cache from '../utils/cache.js';
import { scrapeWebsite } from '../utils/scraper.js';
import imagekit from '../utils/imagekit.js';
import { uploadSingleLogo } from '../service/storage.service.js';
import * as ragService from '../service/rag.service.js';
import * as pineconeService from '../service/pinecone.service.js'; 


export const uploadLogo = (req, res) => {
    uploadSingleLogo(req, res, async (err) => {
        if (err) return res.status(400).json({ message: err.message });
        if (!req.file) return res.status(400).json({ message: "No file uploaded" });

        try {
            const result = await imagekit.upload({
                file: req.file.buffer.toString('base64'),
                fileName: `logo-${Date.now()}`,
                folder: "/business-logos"
            });

            res.json({ success: true, url: result.url });
        } catch (error) {
            console.error("ImageKit Error:", error);
            res.status(500).json({ message: "Failed to upload logo" });
        }
    });
};


export const getBusiness = async (req, res) => {
    try {
        // Multi-tenant check: Agents see their owner's business
        const ownerId = req.user.role === 'agent' ? req.user.ownerId : req.user._id;
        
        let business = await Business.findOne({ owner: ownerId });

        // Auto-create business if not found (only for Owners)
        if (!business && req.user.role === 'owner') {
            business = await Business.create({
                owner: req.user._id,
                name: "My Business",
                // API Key is also auto-generated in pre-save hook of Model (as per our last update)
            });
        }

        if (!business) return res.status(404).json({ message: "Business not found" });
        res.json(business);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


export const updateBusiness = async (req, res) => {
    const { name, supportEmail, knowledge, faqs, appearance } = req.body;
    try {
        const updatePayload = {};
        // Prepare the base payload
        if (typeof name === 'string') updatePayload.name = name;
        if (typeof supportEmail === 'string') updatePayload.supportEmail = supportEmail;
        if (Array.isArray(faqs)) updatePayload.faqs = faqs;
        if (typeof appearance === 'object' && appearance !== null) updatePayload.appearance = appearance;

        if (typeof knowledge === 'string') {
            updatePayload.knowledge = knowledge;
            updatePayload.knowledgeChunks = ragService.createKnowledgeChunksFromText(knowledge);
        }

        // Check if business exists, if not, we will need to generate an apiKey for the upsert
        let business = await Business.findOne({ owner: req.user._id });
        
        if (!business) {
            updatePayload.apiKey = `sb_${crypto.randomBytes(16).toString('hex')}`;
            updatePayload.owner = req.user._id;
        }

        business = await Business.findOneAndUpdate(
            { owner: req.user._id },
            { $set: updatePayload },
            { 
                new: true, 
                runValidators: true, 
                upsert: true, 
                setDefaultsOnInsert: true 
            }
        );

        if (business) {
            cache.del(business.apiKey);
            
            if (updatePayload.knowledgeChunks && pineconeService.isPineconeEnabled()) {
                try {
                    await pineconeService.storeChunksInPinecone(updatePayload.knowledgeChunks, business._id);
                } catch (error) {
                    console.error("Failed to store chunks in Pinecone:", error.message);
                }
            }
        }

        res.json(business);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


export const getNotifications = async (req, res) => {
    try {
        const business = await Business.findOne({ owner: req.user._id }).select('notifications');
        res.json(business?.notifications || []);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


export const markNotificationsRead = async (req, res) => {
    try {
        await Business.updateOne(
            { owner: req.user._id },
            { $set: { "notifications.$[].isRead": true } }
        );
        res.json({ success: true, message: "Notifications marked as read" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


export const scrapeAndTrain = async (req, res) => {
    let { url } = req.body;
    if (!url) return res.status(400).json({ message: "URL is required" });

    // URL Sanitization
    url = url.trim();
    if (!/^https?:\/\//i.test(url)) url = 'https://' + url;

    try {
        new URL(url); // Validation
    } catch (e) {
        return res.status(400).json({ message: "Invalid URL format" });
    }

    // Timeout logic (180s)
    const timeout = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Scraping timed out (180s)")), 180000)
    );

    try {
        const result = await Promise.race([scrapeWebsite(url), timeout]);

        if (!result.knowledge || result.knowledge.length < 100) {
            return res.status(400).json({ message: "Content too thin to train AI." });
        }

        const knowledgeChunks = ragService.createKnowledgeChunksFromPages(result.pages || []);
        const business = await Business.findOneAndUpdate(
            { owner: req.user._id },
            { 
                knowledge: result.knowledge,
                knowledgeChunks,
                lastTrainedAt: new Date(),
                trainedFromUrl: url,
                trainedPagesCount: result.pagesScanned
            },
            { new: true }
        );

        if (business) {
            cache.del(business.apiKey);
            
            if (knowledgeChunks.length > 0 && pineconeService.isPineconeEnabled()) {
                try {
                    await pineconeService.storeChunksInPinecone(knowledgeChunks, business._id);
                } catch (error) {
                    console.error("Failed to store chunks in Pinecone after scraping:", error.message);
                }
            }
        }

        res.json({
            success: true,
            pagesScanned: result.pagesScanned,
            business
        });
    } catch (error) {
        const statusCode = error.message.includes("timed out") ? 504 : 500;
        res.status(statusCode).json({ message: error.message });
    }
};