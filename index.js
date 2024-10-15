const express = require('express');
const bodyParser = require('body-parser');
const { connectDB } = require('./db/db');
const User = require('./models/User');
const WhatsappSession = require('./models/WhatsappSession');
const AuthController = require('./controllers/AuthController');
const WhatsappController = require('./controllers/WhatsappController');
const authRoutes = require('./routes/authRoutes');
const whatsappRoutes = require('./routes/whatsappRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());

// Connect to the database and synchronize models
const syncDatabase = async () => {
    await connectDB();
    await User.sync();
    await WhatsappSession.sync();
    console.log('Database synchronized');
};

syncDatabase();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/whatsapp', whatsappRoutes);

app.listen(PORT, () => { 
    console.log(`Server is running on http://localhost:${PORT}`);
});
