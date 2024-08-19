const { Client } = require('pg');
const mongoose = require('mongoose');

// PostgreSQL client setup
const pgClient = new Client({database: "book-manager"
});
pgClient.connect().then(() => {
    console.log('Connected to PostgreSQL');
}).catch(err => {
    console.error('Failed to connect to PostgreSQL', err);
});

// MongoDB setup
mongoose.connect('mongodb+srv://brianouyang17:<password>@cluster0.udt9pvf.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0', {
}).then(() => {
    console.log('Connected to MongoDB');
}).catch(err => {
    console.error('Failed to connect to MongoDB', err);
});

// Define MongoDB Schema and Model
const bookSchema = new mongoose.Schema({
    title: String,
    author: String
});
const MongoBook = mongoose.model('MongoBook', bookSchema);

module.exports = {
    pgClient,
    MongoBook
};
