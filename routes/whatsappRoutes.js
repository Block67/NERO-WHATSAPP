// whatsappRoutes.js
const express = require('express');
const WhatsappController = require('../controllers/WhatsappController');

const router = express.Router();

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

module.exports = router;
