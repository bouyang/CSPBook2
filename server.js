const express = require('express');
const path = require('path');
const { pgClient, MongoBook } = require('./db');

const app = express();
const port = 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Homepage Route
app.get('/', (req, res) => {
  res.render('home');
});

// Static time app
app.get('/time', (req, res) => {
  const currentTime = new Date().toLocaleTimeString();
    res.render('time', { time: currentTime });
});

// Serve the main book page
app.get('/books', async (req, res) => {
  try {
      const pgBooksResult = await pgClient.query('SELECT * FROM books');
      const pgBooks = pgBooksResult.rows;

      const mongoBooks = await MongoBook.find().exec();

      res.render('index', {
          pgBooks,
          mongoBooks,
          editPgBook: null,
          editMongoBook: null,
          error: null
      });
  } catch (err) {
      res.render('index', { pgBooks: [], mongoBooks: [], editPgBook: null, editMongoBook: null, error: 'Error fetching books' });
  }
});

// Add, update, and edit routes for PostgreSQL
app.post('/submit-postgres', async (req, res) => {
  const { title, author } = req.body;
  try {
      await pgClient.query('INSERT INTO books (title, author) VALUES ($1, $2)', [title, author]);
      res.redirect('/books');
  } catch (err) {
      const pgBooksResult = await pgClient.query('SELECT * FROM books');
      const pgBooks = pgBooksResult.rows;
      const mongoBooks = await MongoBook.find().exec();
      res.render('index', { pgBooks, mongoBooks, editPgBook: null, editMongoBook: null, error: 'Error adding book' });
  }
});

app.get('/edit-postgres/:id', async (req, res) => {
  const { id } = req.params;
  try {
      const result = await pgClient.query('SELECT * FROM books WHERE id = $1', [id]);
      const pgBooksResult = await pgClient.query('SELECT * FROM books');
      const pgBooks = pgBooksResult.rows;
      const mongoBooks = await MongoBook.find().exec();
      res.render('index', { pgBooks, mongoBooks, editPgBook: result.rows[0], editMongoBook: null, error: null });
  } catch (err) {
      const pgBooksResult = await pgClient.query('SELECT * FROM books');
      const pgBooks = pgBooksResult.rows;
      const mongoBooks = await MongoBook.find().exec();
      res.render('index', { pgBooks, mongoBooks, editPgBook: null, editMongoBook: null, error: 'Error fetching book' });
  }
});

app.post('/update-postgres', async (req, res) => {
  const { id, title, author } = req.body;
  try {
      await pgClient.query('UPDATE books SET title = $1, author = $2 WHERE id = $3', [title, author, id]);
      res.redirect('/books');
  } catch (err) {
      const pgBooksResult = await pgClient.query('SELECT * FROM books');
      const pgBooks = pgBooksResult.rows;
      const mongoBooks = await MongoBook.find().exec();
      res.render('index', { pgBooks, mongoBooks, editPgBook: null, editMongoBook: null, error: 'Error updating book' });
  }
});

// Delete route for PostgreSQL
app.post('/delete-postgres/:id', async (req, res) => {
  const { id } = req.params;
  try {
      await pgClient.query('DELETE FROM books WHERE id = $1', [id]);
      res.redirect('/books');
  } catch (err) {
      const pgBooksResult = await pgClient.query('SELECT * FROM books');
      const pgBooks = pgBooksResult.rows;
      const mongoBooks = await MongoBook.find().exec();
      res.render('index', { pgBooks, mongoBooks, editPgBook: null, editMongoBook: null, error: 'Error deleting book' });
  }
});

// Add, update, and edit routes for MongoDB
app.post('/submit-mongodb', async (req, res) => {
  const { title, author } = req.body;
  try {
      const book = new MongoBook({ title, author });
      await book.save();
      res.redirect('/books');
  } catch (err) {
      const pgBooksResult = await pgClient.query('SELECT * FROM books');
      const pgBooks = pgBooksResult.rows;
      const mongoBooks = await MongoBook.find().exec();
      res.render('index', { pgBooks, mongoBooks, editPgBook: null, editMongoBook: null, error: 'Error adding book' });
  }
});

app.get('/edit-mongodb/:id', async (req, res) => {
  const { id } = req.params;
  try {
      const editMongoBook = await MongoBook.findById(id).exec();
      const pgBooksResult = await pgClient.query('SELECT * FROM books');
      const pgBooks = pgBooksResult.rows;
      const mongoBooks = await MongoBook.find().exec();
      res.render('index', { pgBooks, mongoBooks, editPgBook: null, editMongoBook, error: null });
  } catch (err) {
      const pgBooksResult = await pgClient.query('SELECT * FROM books');
      const pgBooks = pgBooksResult.rows;
      const mongoBooks = await MongoBook.find().exec();
      res.render('index', { pgBooks, mongoBooks, editPgBook: null, editMongoBook: null, error: 'Error fetching book' });
  }
});

app.post('/update-mongodb', async (req, res) => {
  const { id, title, author } = req.body;
  try {
      await MongoBook.findByIdAndUpdate(id, { title, author }).exec();
      res.redirect('/books');
  } catch (err) {
      const pgBooksResult = await pgClient.query('SELECT * FROM books');
      const pgBooks = pgBooksResult.rows;
      const mongoBooks = await MongoBook.find().exec();
      res.render('index', { pgBooks, mongoBooks, editPgBook: null, editMongoBook: null, error: 'Error updating book' });
  }
});

// Delete route for MongoDB
app.post('/delete-mongodb/:id', async (req, res) => {
  const { id } = req.params;
  try {
      await MongoBook.findByIdAndDelete(id).exec();
      res.redirect('/books');
  } catch (err) {
      const pgBooksResult = await pgClient.query('SELECT * FROM books');
      const pgBooks = pgBooksResult.rows;
      const mongoBooks = await MongoBook.find().exec();
      res.render('index', { pgBooks, mongoBooks, editPgBook: null, editMongoBook: null, error: 'Error deleting book' });
  }
});

// Start the server
app.listen(3000, () => {
  console.log('Server running on port 3000');
});
