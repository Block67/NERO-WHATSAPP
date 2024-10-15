const { Client, MessageMedia } = require('whatsapp-web.js');
const QRCode = require('qrcode');
const WhatsappSession = require('../models/WhatsappSession'); // Importer le modèle WhatsappSession
const User = require('../models/User'); // Importer le modèle User pour vérifier l'utilisateur
const crypto = require('crypto');

class WhatsappController {
    constructor() {
        this.client = new Client();

        // Handle successful authentication
        this.client.on('ready', async () => {
            console.log('WhatsApp client is ready!');
            // Appel à une méthode pour gérer l'instance après authentification si besoin
        });

        // Start the client
        this.client.initialize();
    }

    async registerInstance(userId) {
        // Vérifier si l'utilisateur existe
        const user = await User.findByPk(userId);
        if (!user) {
            throw new Error('User not found.');
        }

        // Gérer la génération du QR code ici
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

        const accessToken = crypto.randomBytes(32).toString('hex');
        const instanceId = this.client.info.wid; 

        // Créer ou mettre à jour la session pour cet utilisateur
        await WhatsappSession.upsert({ userId, instanceId, accessToken });
        console.log(`Instance registered for user: ${userId} instance : ${instanceId}  with access token: ${accessToken}`);
    }

    async validateInstance(instance_id, access_token) {
        const session = await WhatsappSession.findOne({
            where: { instanceId: instance_id, accessToken: access_token },
            include: User // Inclure l'utilisateur pour vérification
        });
        return session !== null; // Retourne true si valide, sinon false
    }

    // Send a text message to a single number
    async sendText(req, res) {
        const { userId, to, message } = req.body;

        if (!userId || !to || !message) {
            return res.status(400).json({ message: 'User ID, recipient, and message are required.' });
        }

        const formattedTo = `${to}@c.us`;

        try {
            const session = await WhatsappSession.findOne({ where: { userId } });
            if (!session) {
                return res.status(403).json({ message: 'Session not found for this user.' });
            }

            const response = await this.client.sendMessage(formattedTo, message);
            return res.status(200).json({ message: 'Message sent successfully!', response });
        } catch (error) {
            console.error('Error sending message:', error);
            return res.status(500).json({ message: 'Error sending message.', error });
        }
    }

    // Send a text message to multiple numbers
    async sendBulkText(req, res) {
        const { userId, numbers, message } = req.body;

        if (!userId || !Array.isArray(numbers) || !message) {
            return res.status(400).json({ message: 'User ID, numbers (array), and message are required.' });
        }

        try {
            const session = await WhatsappSession.findOne({ where: { userId } });
            if (!session) {
                return res.status(403).json({ message: 'Session not found for this user.' });
            }

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
    async sendMedia(req, res) {
        const { userId, to, mediaUrl, caption } = req.body;

        if (!userId || !to || !mediaUrl) {
            return res.status(400).json({ message: 'User ID, recipient, and media URL are required.' });
        }

        const formattedTo = `${to}@c.us`;

        try {
            const session = await WhatsappSession.findOne({ where: { userId } });
            if (!session) {
                return res.status(403).json({ message: 'Session not found for this user.' });
            }

            const media = await MessageMedia.fromUrl(mediaUrl);
            const response = await this.client.sendMessage(formattedTo, media, { caption });
            return res.status(200).json({ message: 'Media sent successfully!', response });
        } catch (error) {
            console.error('Error sending media:', error);
            return res.status(500).json({ message: 'Error sending media.', error });
        }
    }
}

module.exports = new WhatsappController();
