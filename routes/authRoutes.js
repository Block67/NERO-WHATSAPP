const express = require('express');
const AuthController = require('../controllers/AuthController');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: Auth
 *     description: Operations related to user authentication
 */

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     tags: [Auth]
 *     summary: Enregistrer un nouvel utilisateur
 *     description: Crée un nouvel utilisateur dans le système.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 description: Nom d'utilisateur pour le nouvel utilisateur.
 *               email:
 *                 type: string
 *                 description: Adresse e-mail de l'utilisateur.
 *               password:
 *                 type: string
 *                 description: Mot de passe pour le nouvel utilisateur.
 *     responses:
 *       201:
 *         description: Utilisateur enregistré avec succès.
 *       400:
 *         description: Erreur lors de l'enregistrement de l'utilisateur.
 */
router.post('/register', AuthController.register);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Connexion d'un utilisateur
 *     description: Authentifie un utilisateur avec ses identifiants.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 description: Adresse e-mail de l'utilisateur.
 *               password:
 *                 type: string
 *                 description: Mot de passe de l'utilisateur.
 *     responses:
 *       200:
 *         description: Utilisateur connecté avec succès.
 *       401:
 *         description: Identifiants invalides.
 */
router.post('/login', AuthController.login);

/**
 * @swagger
 * /api/auth/change-password:
 *   post:
 *     tags: [Auth]
 *     summary: Changer le mot de passe
 *     description: Permet à un utilisateur de changer son mot de passe.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               oldPassword:
 *                 type: string
 *                 description: Ancien mot de passe de l'utilisateur.
 *               newPassword:
 *                 type: string
 *                 description: Nouveau mot de passe de l'utilisateur.
 *     responses:
 *       200:
 *         description: Mot de passe changé avec succès.
 *       400:
 *         description: Erreur lors du changement de mot de passe.
 */
router.post('/change-password', AuthController.changePassword);

/**
 * @swagger
 * /api/auth/reset-password:
 *   post:
 *     tags: [Auth]
 *     summary: Réinitialiser le mot de passe
 *     description: Envoie un e-mail de réinitialisation du mot de passe à l'utilisateur.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 description: Adresse e-mail de l'utilisateur.
 *     responses:
 *       200:
 *         description: E-mail de réinitialisation envoyé avec succès.
 *       400:
 *         description: Erreur lors de l'envoi de l'e-mail de réinitialisation.
 */
router.post('/reset-password', AuthController.resetPassword);

/**
 * @swagger
 * /api/auth/confirm-reset-password:
 *   post:
 *     tags: [Auth]
 *     summary: Confirmer la réinitialisation du mot de passe
 *     description: Confirme la réinitialisation du mot de passe avec un code de vérification.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               token:
 *                 type: string
 *                 description: Code de vérification envoyé à l'utilisateur.
 *               newPassword:
 *                 type: string
 *                 description: Nouveau mot de passe de l'utilisateur.
 *     responses:
 *       200:
 *         description: Mot de passe réinitialisé avec succès.
 *       400:
 *         description: Erreur lors de la confirmation de la réinitialisation du mot de passe.
 */
router.post('/confirm-reset-password', AuthController.confirmResetPassword);

module.exports = router;
