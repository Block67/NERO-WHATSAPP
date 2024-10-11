const { Client, MessageMedia } = require('whatsapp-web.js');
const QRCode = require('qrcode');
const User = require('../models/User');
const { v4: uuidv4 } = require('uuid');
const crypto = require('crypto');

class WhatsappController {
    constructor() {
        // Initialize the WhatsApp client without session
        this.client = new Client();

        // Log when the client initializes
        console.log('WhatsApp client initializing...');

        // QR Code generation event
        this.client.on('qr', (qr) => {
            QRCode.toDataURL(qr, (err, url) => {
                if (err) {
                    console.error('Error generating QR code:', err);
                } else {
                    console.log('QR Code generated. Scan this QR code:', url);
                }
            });
        });

        // Client ready event
        this.client.on('ready', async () => {
            console.log('WhatsApp client is ready!');
        });

        // Client authenticated event
        this.client.on('authenticated', async () => {
            console.log('Client authenticated.');

            // Create the instance and generate access token after authentication
            const instanceDetails = await this.registerInstance();

            console.log('Authenticated instance details:', instanceDetails);
        });

        // Handle authentication failure
        this.client.on('auth_failure', (msg) => {
            console.error('Authentication failure:', msg);
        });

        // Handle client disconnection
        this.client.on('disconnected', (reason) => {
            console.error('WhatsApp client disconnected:', reason);
        });

        // Error handling
        this.client.on('error', (err) => {
            console.error('Client error:', err);
        });

        // Start the client
        this.client.initialize().then(() => {
            console.log('WhatsApp client initialized.');
        }).catch((error) => {
            console.error('Error initializing WhatsApp client:', error);
        });
    }

    // Method to register an instance and return the userId and accessToken
    async registerInstance() {
        const userId = `user_${uuidv4()}`; // Generate a unique user ID
        const accessToken = crypto.randomBytes(7).toString('hex'); // Generate an access token

        try {
            // Register the instance in the database
            await User.create({ userId, accessToken });
            console.log(`Instance registered: ${userId} with access token: ${accessToken}`);
            
            // Return the instance details
            return { userId, accessToken };
        } catch (error) {
            console.error('Error registering instance:', error);
            throw error;
        }
    }

    async validateInstance(instance_id, access_token) {
        const user = await User.findOne({ where: { userId: instance_id, accessToken: access_token } });
        return user !== null;
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

    // Retrieve the instance details
    async getInstanceDetails(req, res) {
        try {
            const user = await User.findOne({ order: [['createdAt', 'DESC']] });
            if (user) {
                return res.status(200).json({ userId: user.userId, accessToken: user.accessToken });
            } else {
                return res.status(404).json({ message: 'No instance found.' });
            }
        } catch (error) {
            console.error('Error fetching instance details:', error);
            return res.status(500).json({ message: 'Error fetching instance details.' });
        }
    }
}

module.exports = new WhatsappController();
