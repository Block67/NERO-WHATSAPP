const express = require('express');
const WhatsappController = require('../controllers/WhatsappController');

const router = express.Router();

// Route pour enregistrer une instance
router.post('/register-instance', async (req, res) => {
    const { userId } = req.body;
    try {
        await WhatsappController.registerInstance(userId);
        res.status(200).json({ message: 'Instance registered successfully.' });
    } catch (error) {
        res.status(500).json({ message: 'Error registering instance.', error: error.message });
    }
});


router.post('/send-text', WhatsappController.sendText);
router.post('/send-bulk-text', WhatsappController.sendBulkText);
router.post('/send-media', WhatsappController.sendMedia);
router.post('/get-user-profile', WhatsappController.getUserProfile)
router.post('/send-template-message', WhatsappController.sendTemplateMessage);
router.post('/schedule-message', WhatsappController.scheduleMessage);
router.post('/send-location', WhatsappController.sendLocation);

module.exports = router;
