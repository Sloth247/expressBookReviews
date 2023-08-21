const express = require('express');
const axios = require('axios');
let books = require('./booksdb.js');
let isValid = require('./auth_users.js').isValid;
let users = require('./auth_users.js').users;
const public_users = express.Router();

const doesExist = (username) => {
  let userswithsamename = users.filter((user) => {
    return user.username === username;
  });
  if (userswithsamename.length > 0) {
    return true;
  } else {
    return false;
  }
};

public_users.post('/register', (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (username && password) {
    if (!doesExist(username)) {
      users.push({ username: username, password: password });
      return res
        .status(200)
        .json({ message: 'User successfully registred. Now you can login' });
    } else {
      return res.status(404).json({ message: 'User already exists!' });
    }
  }
  return res.status(404).json({ message: 'Unable to register user.' });
});

// Get the book list available in the shop
// public_users.get('/', function (req, res) {
//   res.send(JSON.stringify(books, null, 4));
// });
const fetchBooksData = () => {
  return new Promise((resolve, reject) => {
    try {
      setTimeout(() => {
        resolve(books);
      }, 1000);
    } catch (error) {
      reject(error);
    }
  });
};

public_users.get('/', async function (req, res) {
  try {
    const booksData = await fetchBooksData();
    res.send(JSON.stringify(booksData, null, 4));
  } catch (error) {
    res.status(500).send('Error fetching data');
  }
});

// Get book details based on ISBN
// public_users.get('/isbn/:isbn', function (req, res) {
//   const isbn = req.params.isbn;
//   res.send(books[isbn]);
// });

const getBookDetailsByISBN = async (isbn) => {
  const book = books[isbn];
  if (book) {
    return book;
  } else {
    throw new Error('Book not found.');
  }
};

public_users.get('/isbn/:isbn', async function (req, res) {
  const isbnToFind = req.params.isbn;

  try {
    const book = await getBookDetailsByISBN(isbnToFind);
    res.json(book);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
});

// Get book details based on author
// public_users.get('/author/:author', function (req, res) {
//   const authorToFind = req.params.author;
//   const matchingBooks = [];

//   for (const bookKey in books) {
//     if (books.hasOwnProperty(bookKey)) {
//       const book = books[bookKey];
//       const lowAuthor = book.author.toLowerCase();
//       const authorStr = lowAuthor.replace(/\s/g, '');
//       if (authorStr === authorToFind) {
//         matchingBooks.push(book);
//       }
//     }
//   }
//   if (matchingBooks.length === 0) {
//     res.status(404).json({ message: 'No books found for the author.' });
//   } else {
//     res.json(matchingBooks);
//   }
// });

const getBooksByAuthor = async (author) => {
  const matchingBooks = [];
  const authorToFind = author.toLowerCase().replace(/\s/g, '');

  for (const bookKey in books) {
    if (books.hasOwnProperty(bookKey)) {
      const book = books[bookKey];
      const lowAuthor = book.author.toLowerCase().replace(/\s/g, '');
      if (authorToFind === lowAuthor) {
        matchingBooks.push(book);
      }
    }
  }

  if (matchingBooks.length === 0) {
    throw new Error('No books found for the author.');
  } else {
    return matchingBooks;
  }
};

public_users.get('/author/:author', async function (req, res) {
  const authorToFind = req.params.author;

  try {
    const matchingBooks = await getBooksByAuthor(authorToFind);
    res.json(matchingBooks);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
});

// Get all books based on title
// public_users.get('/title/:title', function (req, res) {
//   const titleToFind = req.params.title;
//   const matchingBooks = [];

//   for (const bookKey in books) {
//     if (books.hasOwnProperty(bookKey)) {
//       const book = books[bookKey];
//       const lowTitle = book.title.toLowerCase();
//       const titleStr = lowTitle.replace(/\s/g, '');
//       if (titleStr === titleToFind) {
//         matchingBooks.push(book);
//       }
//     }
//   }
//   if (matchingBooks.length === 0) {
//     res.status(404).json({ message: 'No books found for the title.' });
//   } else {
//     res.json(matchingBooks);
//   }
// });

const getBooksByTitle = async (title) => {
  const matchingBooks = [];
  const titleToFind = title.toLowerCase().replace(/\s/g, '');

  for (const bookKey in books) {
    if (books.hasOwnProperty(bookKey)) {
      const book = books[bookKey];
      const lowTitle = book.title.toLowerCase().replace(/\s/g, '');
      if (titleToFind === lowTitle) {
        matchingBooks.push(book);
      }
    }
  }

  if (matchingBooks.length === 0) {
    throw new Error('No books found for the title.');
  } else {
    return matchingBooks;
  }
};

public_users.get('/title/:title', async function (req, res) {
  const titleToFind = req.params.title;

  try {
    const matchingBooks = await getBooksByTitle(titleToFind);
    res.json(matchingBooks);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
});

//  Get book review
public_users.get('/review/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  if (isbn && books[isbn] && books[isbn].review) {
    res.send(books[isbn].review);
  } else {
    res.status(404).json({ message: 'No reviews found for the ISBN.' });
  }
});

module.exports.general = public_users;
