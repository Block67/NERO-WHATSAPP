const bcrypt = require('bcrypt');
const User = require('../models/User');
const crypto = require('crypto');
const { sendEmail } = require('../services/emailService');
const jwt = require('jsonwebtoken');
require('dotenv').config();

class AuthController {
    // Inscription d'un nouvel utilisateur
    async register(req, res) {
        const { firstName, lastName, whatsappNumber, email, password } = req.body;
    
        if (!firstName || !lastName || !whatsappNumber || !email || !password ) {
            return res.status(400).json({ message: 'Tous les champs sont requis.' });
        }
    
        try {
            const user = await User.create({ 
                firstName, 
                lastName, 
                whatsappNumber, 
                email, 
                password
            });
    
            // Hachage du mot de passe après la création de l'utilisateur
            user.password = await bcrypt.hash(user.password, 10);
            await user.save();
    
            return res.status(201).json({ message: 'Utilisateur inscrit avec succès.', user });
        } catch (error) {
            console.error('Erreur lors de l\'inscription:', error);
            return res.status(500).json({ message: 'Erreur lors de l\'inscription.' });
        }
    }
    

    // Connexion d'un utilisateur
    async login(req, res) {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Email et mot de passe sont requis.' });
        }

        try {
            const user = await User.findOne({ where: { email } });
            if (!user) {
                return res.status(401).json({ message: 'Email ou mot de passe incorrect.' });
            }

            const isPasswordValid = await bcrypt.compare(password, user.password);
            if (!isPasswordValid) {
                return res.status(401).json({ message: 'Email ou mot de passe incorrect.' });
            }

            // Générer un token JWT
            const token = jwt.sign(
                { id: user.id, email: user.email }, 
                process.env.JWT_SECRET,
                { expiresIn: '1h' }
            );

            return res.status(200).json({ message: 'Connexion réussie.', token });
        } catch (error) {
            console.error('Erreur lors de la connexion:', error);
            return res.status(500).json({ message: 'Erreur lors de la connexion.' });
        }
    }

    // Changement de mot de passe
    async changePassword(req, res) {
        const { userId, oldPassword, newPassword, newPasswordConfirmation } = req.body;

        if (!userId || !oldPassword || !newPassword || !newPasswordConfirmation) {
            return res.status(400).json({ message: 'Tous les champs sont requis.' });
        }

        try {
            const user = await User.findByPk(userId);
            if (!user) {
                return res.status(404).json({ message: 'Utilisateur non trouvé.' });
            }

            const isOldPasswordValid = await bcrypt.compare(oldPassword, user.password);
            if (!isOldPasswordValid) {
                return res.status(401).json({ message: 'L\'ancien mot de passe est incorrect.' });
            }

            if (newPassword !== newPasswordConfirmation) {
                return res.status(400).json({ message: 'Le nouveau mot de passe et sa confirmation ne correspondent pas.' });
            }

            user.password = await bcrypt.hash(newPassword, 10);
            await user.save();

            return res.status(200).json({ message: 'Mot de passe changé avec succès.' });
        } catch (error) {
            console.error('Erreur lors du changement de mot de passe:', error);
            return res.status(500).json({ message: 'Erreur lors du changement de mot de passe.' });
        }
    }

    // Réinitialisation de mot de passe
    async resetPassword(req, res) {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ message: 'L\'email est requis.' });
        }

        try {
            const user = await User.findOne({ where: { email } });
            if (!user) {
                return res.status(404).json({ message: 'Utilisateur non trouvé.' });
            }

            // Générer un token de réinitialisation
            const resetToken = crypto.randomBytes(20).toString('hex');
            user.resetToken = resetToken; // Vous devrez ajouter ce champ dans votre modèle User
            user.resetTokenExpiry = Date.now() + 3600000; // Token valide pendant 1 heure
            await user.save();

            const resetLink = `http://yourwebsite.com/reset-password?token=${resetToken}`;
            await sendEmail(user.email, 'Réinitialisation de votre mot de passe', `Cliquez sur ce lien pour réinitialiser votre mot de passe: ${resetLink}`);

            return res.status(200).json({ message: 'Un lien de réinitialisation a été envoyé à votre email.' });
        } catch (error) {
            console.error('Erreur lors de la réinitialisation du mot de passe:', error);
            return res.status(500).json({ message: 'Erreur lors de la réinitialisation du mot de passe.' });
        }
    }

    // Méthode pour gérer la réinitialisation effective du mot de passe
    async confirmResetPassword(req, res) {
        const { token, newPassword, newPasswordConfirmation } = req.body;

        if (!token || !newPassword || !newPasswordConfirmation) {
            return res.status(400).json({ message: 'Tous les champs sont requis.' });
        }

        try {
            const user = await User.findOne({ where: { resetToken: token, resetTokenExpiry: { [Op.gt]: Date.now() } } });
            if (!user) {
                return res.status(400).json({ message: 'Token de réinitialisation invalide ou expiré.' });
            }

            if (newPassword !== newPasswordConfirmation) {
                return res.status(400).json({ message: 'Le nouveau mot de passe et sa confirmation ne correspondent pas.' });
            }

            user.password = await bcrypt.hash(newPassword, 10);
            user.resetToken = null; // Réinitialiser le token
            user.resetTokenExpiry = null; // Réinitialiser l'expiration
            await user.save();

            return res.status(200).json({ message: 'Mot de passe réinitialisé avec succès.' });
        } catch (error) {
            console.error('Erreur lors de la confirmation de la réinitialisation du mot de passe:', error);
            return res.status(500).json({ message: 'Erreur lors de la réinitialisation du mot de passe.' });
        }
    }
}

module.exports = new AuthController();
