import express from 'express';
import DictionaryRoutes from './routes/DictionaryRoutes';
const cors = require('cors');

// Initialize the Express app
const app = express();
const port = 3000;

// Create an instance of the DictionaryRoutes with an InMemoryProvide

// Middleware to parse JSON bodies
app.use(cors());
app.use(express.json());

// Use the dictionary routes
app.use('/api/dictionary', DictionaryRoutes);

// Start the server
app.listen(port, () => {
    console.log(`English Directory is running on http://localhost:${port}`);
});