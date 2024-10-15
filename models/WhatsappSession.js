const { DataTypes } = require('sequelize');
const { sequelize } = require('../db/db');
const User = require('../models/User');

const WhatsappSession = sequelize.define('WhatsappSession', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,     
        primaryKey: true,      
    },
    userId: {
        type: DataTypes.INTEGER, 
        allowNull: false,
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

// Définir la relation
WhatsappSession.belongsTo(User, { foreignKey: 'userId', targetKey: 'id' });

module.exports = WhatsappSession;
