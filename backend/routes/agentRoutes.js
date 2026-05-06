const express = require('express');
const router = express.Router();
const { 
    addAgent, 
    listAgents, 
    deleteAgent, 
    updateProfile, 
    updateAvailability,
    getAgentStats, 
    joinConversation,
    resolveConversation
} = require('../controllers/agentController');
const { protect } = require('../middleware/authMiddleware');

// Business Owner Routes
router.post('/add', protect, addAgent);
router.get('/list', protect, listAgents);
router.delete('/:id', protect, deleteAgent);
router.post('/notify/:id', protect, require('../controllers/agentController').notifyAgent);
router.post('/notify-all', protect, require('../controllers/agentController').notifyAllAgents);

// Agent Routes
router.put('/update-profile', protect, updateProfile);
router.put('/update-availability', protect, updateAvailability);
router.get('/stats', protect, getAgentStats);
router.put('/join/:id', protect, joinConversation);
router.put('/resolve/:id', protect, resolveConversation);

module.exports = router;
