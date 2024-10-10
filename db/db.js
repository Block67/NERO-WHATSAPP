const { Sequelize } = require('sequelize');

const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: './database.sqlite',
});

const connectDB = async () => {
    try {
        await sequelize.authenticate();
        console.log('Connexion à SQLite réussie');
    } catch (error) {
        console.error('Erreur de connexion à SQLite:', error);
        process.exit(1);
    }
};

module.exports = { sequelize, connectDB };
