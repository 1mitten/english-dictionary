export { WordMetadata } from './types/WordMetadata.type'

import express from 'express';
import DictionaryRoutes from './routes/DictionaryRoutes';
import { splitJsonFile } from './utils/File.util'
const cors = require('cors');

splitJsonFile('/code/database.json');

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