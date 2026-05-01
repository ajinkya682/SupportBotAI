import express from 'express';
const router = express.Router();

import { 
    addAgent, 
    listAgents, 
    deleteAgent, 
    updateProfile, 
    updateAvailability,
    getAgentStats, 
    joinConversation,
    resolveConversation
} from '../controller/agent.controller.js';


import { protect } from '../middlewares/auth.middleware.js';
import { uploadSinglePhoto } from '../service/storage.service.js';

/**
 * @desc    Global Middleware
 * Saare agent routes protected hain, isliye baar-baar 'protect' 
 * likhne ke bajaye hum router level par apply kar sakte hain.
 */
router.use(protect);

/**
 * @route   Management Routes (Business Owner)
 */
router.route('/')
    .get(listAgents)   
    .post(addAgent);   

router.delete('/:id', deleteAgent); 

/**
 * @route   Agent Operational Routes
 */
router.get('/stats', getAgentStats);


router.patch('/update-profile', uploadSinglePhoto, updateProfile);

router.patch('/update-availability', updateAvailability);

/**
 * @route   Conversation Management
 */
router.patch('/join/:id', joinConversation);
router.patch('/resolve/:id', resolveConversation);

export default router;