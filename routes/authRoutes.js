// authRoutes.js
const express = require('express');
const AuthController = require('../controllers/AuthController');

const router = express.Router();

router.post('/register', AuthController.register);
router.post('/login', AuthController.login);
router.post('/change-password', AuthController.changePassword);
router.post('/reset-password', AuthController.resetPassword);
router.post('/confirm-reset-password', AuthController.confirmResetPassword);

module.exports = router;
