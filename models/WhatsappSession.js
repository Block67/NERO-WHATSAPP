const { DataTypes } = require('sequelize');
const { sequelize } = require('../db/db');
const User = require('../models/User');

const WhatsappSession = sequelize.define('WhatsappSession', {
    userId: {
        type: DataTypes.STRING,
        primaryKey: true,
        references: {
            model: User,
            key: 'id',
        },
    },
    instanceId: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    accessToken: {
        type: DataTypes.STRING,
        allowNull: false,
    },
});

WhatsappSession.belongsTo(User, { foreignKey: 'userId', targetKey: 'id' });

module.exports = WhatsappSession;
