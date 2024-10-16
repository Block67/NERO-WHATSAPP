const { Client, MessageMedia } = require('whatsapp-web.js');
const QRCode = require('qrcode');
const WhatsappSession = require('../models/WhatsappSession');
const User = require('../models/User');
const crypto = require('crypto');

class WhatsappController {
    constructor() {
        this.client = null;  

        // Liaison des méthodes au contexte de l'instance
        this.registerInstance = this.registerInstance.bind(this);
        this.sendText = this.sendText.bind(this);
        this.sendBulkText = this.sendBulkText.bind(this);
        this.sendMedia = this.sendMedia.bind(this);
        this.getUserProfile = this.getUserProfile.bind(this);
    }

    async registerInstance(userId) {
        // Vérifier si l'utilisateur existe
        const user = await User.findByPk(userId);
        if (!user) {
            throw new Error('User not found.');
        }

        const instanceId = crypto.randomBytes(10).toString('hex');
        const accessToken = crypto.randomBytes(10).toString('hex');
        
        // Créer ou mettre à jour la session pour cet utilisateur
        await WhatsappSession.upsert({ userId, instanceId, accessToken });
        console.log(`Instance registered for user: ${userId} with instanceId: ${instanceId} and access token: ${accessToken}`);

        // Initialiser le client WhatsApp après avoir enregistré l'instance
        this.client = new Client();

        this.client.on('ready', async () => {
            console.log('WhatsApp client is ready!');
        });

        // Génération du qr code
        this.client.on('qr', (qr) => {
            QRCode.toDataURL(qr, (err, url) => {
                if (err) {
                    console.error('Error generating QR code:', err);
                } else {
                    console.log('QR Code generated:', url);
                    // Envoie l'URL du QR code ici si nécessaire
                }
            });
        });

        // Initialiser le client après l'enregistrement de l'instance
        this.client.initialize();
    }

    async validateInstance(instance_id, access_token) {
        const session = await WhatsappSession.findOne({
            where: { instanceId: instance_id, accessToken: access_token },
            include: User 
        });
        return session !== null; 
    }

    // Send a text message to a single number
    sendText = async (req, res) => {
        const { instance_id, access_token, to, message } = req.body;

        if (!instance_id || !access_token || !to || !message) {
            return res.status(400).json({ message: 'Instance ID, access token, recipient, and message are required.' });
        }

        const formattedTo = `${to}@c.us`;

        try {
            // Valider la session avec instance_id et access_token
            const isValidSession = await this.validateInstance(instance_id, access_token);
            if (!isValidSession) {
                return res.status(403).json({ message: 'Invalid session credentials.' });
            }

            // Envoyer le message via le client WhatsApp
            const response = await this.client.sendMessage(formattedTo, message);
            return res.status(200).json({ message: 'Message sent successfully!', response });
        } catch (error) {
            console.error('Error sending message:', error);
            return res.status(500).json({ message: 'Error sending message.', error });
        }
    }

    // Send a text message to multiple numbers
    sendBulkText = async (req, res) => {
        const { instance_id, access_token, numbers, message } = req.body;

        if (!instance_id || !access_token || !Array.isArray(numbers) || !message) {
            return res.status(400).json({ message: 'Instance ID, access token, numbers (array), and message are required.' });
        }

        try {
            // Valider la session avec instance_id et access_token
            const isValidSession = await this.validateInstance(instance_id, access_token);
            if (!isValidSession) {
                return res.status(403).json({ message: 'Invalid session credentials.' });
            }

            // Envoyer les messages
            const results = [];
            for (const number of numbers) {
                const formattedNumber = `${number}@c.us`;
                try {
                    const response = await this.client.sendMessage(formattedNumber, message);
                    results.push({ number, status: 'sent', response });
                } catch (error) {
                    results.push({ number, status: 'failed', error: error.message });
                }
            }
            return res.status(200).json({ message: 'Messages sent.', results });
        } catch (error) {
            console.error('Error sending bulk messages:', error);
            return res.status(500).json({ message: 'Error sending bulk messages.', error });
        }
    }

    // Send a media file
    sendMedia = async (req, res) => {
        const { instance_id, access_token, to, mediaUrl, caption } = req.body;

        if (!instance_id || !access_token || !to || !mediaUrl) {
            return res.status(400).json({ message: 'Instance ID, access token, recipient, and media URL are required.' });
        }

        const formattedTo = `${to}@c.us`;

        try {
            // Valider la session avec instance_id et access_token
            const isValidSession = await this.validateInstance(instance_id, access_token);
            if (!isValidSession) {
                return res.status(403).json({ message: 'Invalid session credentials.' });
            }

            const media = await MessageMedia.fromUrl(mediaUrl);
            const response = await this.client.sendMessage(formattedTo, media, { caption });
            return res.status(200).json({ message: 'Media sent successfully!', response });
        } catch (error) {
            console.error('Error sending media:', error);
            return res.status(500).json({ message: 'Error sending media.', error });
        }
    }

    // Get user profile information
    getUserProfile = async (req, res) => {
        const { instance_id, access_token, to } = req.body;

        if (!instance_id || !access_token || !to) {
            return res.status(400).json({ message: 'Instance ID, access token, and recipient are required.' });
        }

        const formattedTo = `${to}@c.us`;

        try {
            // Valider la session avec instance_id et access_token
            const isValidSession = await this.validateInstance(instance_id, access_token);
            if (!isValidSession) {
                return res.status(403).json({ message: 'Invalid session credentials.' });
            }

            const profile = await this.client.getContactById(formattedTo);
            return res.status(200).json({ message: 'User profile retrieved successfully!', profile });
        } catch (error) {
            console.error('Error getting user profile:', error);
            return res.status(500).json({ message: 'Error getting user profile.', error });
        }
    }

}

module.exports = new WhatsappController();
