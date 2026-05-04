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
        const ownerId = req.user.role === 'agent' ? req.user.ownerId : req.user._id;
        let business = await Business.findOne({ owner: ownerId });

        if (!business && req.user.role === 'owner') {
            business = await Business.create({
                owner: req.user._id,
                name: "My Business",
            });
        }

        // REPAIR: Ensure API key exists
        if (business && !business.apiKey) {
            business.apiKey = `sb_${crypto.randomBytes(16).toString('hex')}`;
            await business.save();
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
        if (typeof name === 'string') updatePayload.name = name;
        if (typeof supportEmail === 'string') updatePayload.supportEmail = supportEmail;
        if (Array.isArray(faqs)) updatePayload.faqs = faqs;
        if (typeof appearance === 'object' && appearance !== null) {
            updatePayload.appearance = {
                ...appearance,
                // Ensure botName defaults to business name if empty
                botName: appearance.botName || name || 'AI Assistant'
            };
        }

        if (typeof knowledge === 'string') {
            updatePayload.knowledge = knowledge;
            // RAG Support: Create chunks for vector search
            if (ragService.createKnowledgeChunksFromText) {
                updatePayload.knowledgeChunks = ragService.createKnowledgeChunksFromText(knowledge);
            }
        }

        let business = await Business.findOneAndUpdate(
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
            
            // RAG Support: Store in Pinecone if enabled
            if (updatePayload.knowledgeChunks && pineconeService.isPineconeEnabled && pineconeService.isPineconeEnabled()) {
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

    url = url.trim();
    if (!/^https?:\/\//i.test(url)) url = 'https://' + url;

    try {
        new URL(url);
    } catch (e) {
        return res.status(400).json({ message: "Invalid URL format" });
    }

    try {
        const result = await scrapeWebsite(url);

        if (!result.knowledge || result.knowledge.length < 100) {
            return res.status(400).json({ message: "Content too thin to train AI." });
        }

        const knowledgeChunks = ragService.createKnowledgeChunksFromPages ? ragService.createKnowledgeChunksFromPages(result.pages || []) : [];
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
            
            if (knowledgeChunks.length > 0 && pineconeService.isPineconeEnabled && pineconeService.isPineconeEnabled()) {
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
        res.status(500).json({ message: error.message });
    }
};