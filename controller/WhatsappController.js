const { Client, MessageMedia } = require('whatsapp-web.js');
const QRCode = require('qrcode');
const User = require('../models/User');
const { v4: uuidv4 } = require('uuid');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

class WhatsappController {
    constructor() {
        this.client = new Client({
            session: this.loadSession(), // Charger la session si elle existe
        });

        // Handle QR code generation
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

        // Handle successful authentication
        this.client.on('ready', async () => {
            console.log('WhatsApp client is ready!');
            await this.registerInstance();
        });

        // Save session on authentication
        this.client.on('authenticated', (session) => {
            this.saveSession(session);
        });

        // Start the client
        this.client.initialize();
    }

    loadSession() {
        const sessionPath = path.join(__dirname, '../session.json');
        if (fs.existsSync(sessionPath)) {
            return JSON.parse(fs.readFileSync(sessionPath, 'utf8'));
        }
        return null; // Pas de session existante
    }

    saveSession(session) {
        const sessionPath = path.join(__dirname, '../session.json');
        fs.writeFileSync(sessionPath, JSON.stringify(session));
    }

    async registerInstance() {
        const userId = `user_${uuidv4()}`; // Exemple : Utiliser un UUID pour un ID unique
        const accessToken = crypto.randomBytes(32).toString('hex'); // Générer le token

        await User.create({ userId, accessToken });
        console.log(`Instance registered: ${userId} with access token: ${accessToken}`);
    }

    async validateInstance(instance_id, access_token) {
        const user = await User.findOne({ where: { userId: instance_id, accessToken: access_token } });
        return user !== null; // Retourne true si valide, sinon false
    }

    // Send a text message to a single number
    async sendText(req, res) {
        const { instance_id, access_token, to, message } = req.body;

        if (!instance_id || !access_token || !to || !message) {
            return res.status(400).json({ message: 'Instance ID, Access Token, recipient, and message are required.' });
        }

        const formattedTo = `${to}@c.us`;

        try {
            if (!(await this.validateInstance(instance_id, access_token))) {
                return res.status(403).json({ message: 'Invalid instance ID or access token.' });
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
        const { instance_id, access_token, numbers, message } = req.body;

        if (!instance_id || !access_token || !Array.isArray(numbers) || !message) {
            return res.status(400).json({ message: 'Instance ID, Access Token, numbers (array), and message are required.' });
        }

        try {
            if (!(await this.validateInstance(instance_id, access_token))) {
                return res.status(403).json({ message: 'Invalid instance ID or access token.' });
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
        const { instance_id, access_token, to, mediaUrl, caption } = req.body;

        if (!instance_id || !access_token || !to || !mediaUrl) {
            return res.status(400).json({ message: 'Instance ID, Access Token, recipient, and media URL are required.' });
        }

        const formattedTo = `${to}@c.us`;

        try {
            if (!(await this.validateInstance(instance_id, access_token))) {
                return res.status(403).json({ message: 'Invalid instance ID or access token.' });
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
