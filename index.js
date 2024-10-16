const express = require('express');
const bodyParser = require('body-parser');
const { connectDB } = require('./db/db');
const User = require('./models/User');
const WhatsappSession = require('./models/WhatsappSession');
const AuthController = require('./controllers/AuthController');
const WhatsappController = require('./controllers/WhatsappController');
const authRoutes = require('./routes/authRoutes');
const whatsappRoutes = require('./routes/whatsappRoutes');
const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware pour analyser le corps des requêtes
app.use(bodyParser.json());

// Configuration de Swagger
const swaggerOptions = {
    swaggerDefinition: {
        openapi: '3.0.0',
        info: {
            title: 'API WhatsApp',
            version: '1.0.0',
            description: 'API pour envoyer des messages via WhatsApp. By [Rahamane BODA]',
        },
        servers: [
            {
                url: `http://localhost:${PORT}`,
            },
        ],
    },
    apis: ['./routes/*.js'],
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Connect to the database and synchronize models
const syncDatabase = async () => {
    await connectDB();
    await User.sync();
    await WhatsappSession.sync();
    console.log('Database synchronized');
};

syncDatabase();

app.get('/', (req, res) => {
    res.send('App is running');
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/whatsapp', whatsappRoutes);

// Démarrer le serveur
app.listen(PORT, () => { 
    console.log(`Server is running on http://localhost:${PORT}`);
});
