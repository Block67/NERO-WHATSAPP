const express = require('express');
const WhatsappController = require('../controllers/WhatsappController');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: WhatsApp
 *     description: Operations related to WhatsApp instances
 */

/**
 * @swagger
 * /api/whatsapp/register-instance:
 *   post:
 *     tags: [WhatsApp]
 *     summary: Enregistrer une instance
 *     description: Enregistre une instance WhatsApp pour un utilisateur.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *                 description: ID de l'utilisateur pour l'enregistrement de l'instance.
 *     responses:
 *       200:
 *         description: Instance registered successfully.
 *       500:
 *         description: Error registering instance.
 */
router.post('/register-instance', async (req, res) => {
    const { userId } = req.body;
    try {
        await WhatsappController.registerInstance(userId);
        res.status(200).json({ message: 'Instance registered successfully.' });
    } catch (error) {
        res.status(500).json({ message: 'Error registering instance.', error: error.message });
    }
});

/**
 * @swagger
 * /api/whatsapp/send-text:
 *   post:
 *     tags: [WhatsApp]
 *     summary: Envoyer un message texte
 *     description: Envoie un message texte à un numéro spécifique.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               instance_id:
 *                 type: string
 *                 description: ID de l'instance WhatsApp.
 *               access_token:
 *                 type: string
 *                 description: Token d'accès pour l'instance.
 *               to:
 *                 type: string
 *                 description: Numéro de téléphone du destinataire.
 *               message:
 *                 type: string
 *                 description: Le message à envoyer.
 *     responses:
 *       200:
 *         description: Message sent successfully.
 *       500:
 *         description: Error sending message.
 */
router.post('/send-text', WhatsappController.sendText);

/**
 * @swagger
 * /api/whatsapp/send-bulk-text:
 *   post:
 *     tags: [WhatsApp]
 *     summary: Envoyer des messages texte en masse
 *     description: Envoie des messages texte à plusieurs numéros.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               instance_id:
 *                 type: string
 *                 description: ID de l'instance WhatsApp.
 *               access_token:
 *                 type: string
 *                 description: Token d'accès pour l'instance.
 *               recipients:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Liste des numéros de téléphone des destinataires.
 *               message:
 *                 type: string
 *                 description: Le message à envoyer.
 *     responses:
 *       200:
 *         description: Bulk messages sent successfully.
 *       500:
 *         description: Error sending bulk messages.
 */
router.post('/send-bulk-text', WhatsappController.sendBulkText);

/**
 * @swagger
 * /api/whatsapp/send-media:
 *   post:
 *     tags: [WhatsApp]
 *     summary: Envoyer des médias
 *     description: Envoie un fichier média à un numéro spécifique.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               instance_id:
 *                 type: string
 *                 description: ID de l'instance WhatsApp.
 *               access_token:
 *                 type: string
 *                 description: Token d'accès pour l'instance.
 *               to:
 *                 type: string
 *                 description: Numéro de téléphone du destinataire.
 *               media_url:
 *                 type: string
 *                 description: URL du fichier média à envoyer.
 *     responses:
 *       200:
 *         description: Media sent successfully.
 *       500:
 *         description: Error sending media.
 */
router.post('/send-media', WhatsappController.sendMedia);

/**
 * @swagger
 * /api/whatsapp/get-user-profile:
 *   post:
 *     tags: [WhatsApp]
 *     summary: Obtenir le profil utilisateur
 *     description: Récupère le profil utilisateur à partir de l'instance WhatsApp.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               instance_id:
 *                 type: string
 *                 description: ID de l'instance WhatsApp.
 *               access_token:
 *                 type: string
 *                 description: Token d'accès pour l'instance.
 *     responses:
 *       200:
 *         description: User profile retrieved successfully.
 *       500:
 *         description: Error retrieving user profile.
 */
router.post('/get-user-profile', WhatsappController.getUserProfile);

module.exports = router;
