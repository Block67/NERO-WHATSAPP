const { DataTypes } = require('sequelize');
const { sequelize } = require('../db/db');

const User = sequelize.define('User', {
    userId: {
        type: DataTypes.STRING,
        primaryKey: true,
    },
    accessToken: {
        type: DataTypes.STRING,
        allowNull: false,
    },
});

module.exports = User;
