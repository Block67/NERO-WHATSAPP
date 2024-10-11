const express = require('express');
const bodyParser = require('body-parser');
const { connectDB } = require('./db/db');
const WazapController = require('./controller/WhatsappController');
const User = require('./models/User');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());

// Connect to the database and synchronize models
const syncDatabase = async () => {
    await connectDB();
    await User.sync();
    console.log('Database synchronized');
};

syncDatabase();

// Routes
app.post('/api/send-text', (req, res) => WazapController.sendText(req, res));
app.post('/api/send-bulk-text', (req, res) => WazapController.sendBulkText(req, res));
app.post('/api/send-media', (req, res) => WazapController.sendMedia(req, res));
app.get('/api/instance-details', (req, res) => WazapController.getInstanceDetails(req, res));

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
