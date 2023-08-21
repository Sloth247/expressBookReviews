const express = require('express');
const jwt = require('jsonwebtoken');
let books = require('./booksdb.js');
const regd_users = express.Router();

let users = [];

const isValid = (username) => {
  //returns boolean
  //write code to check is the username is valid
};

const authenticatedUser = (username, password) => {
  let validusers = users.filter((user) => {
    return user.username === username && user.password === password;
  });
  if (validusers.length > 0) {
    return true;
  } else {
    return false;
  }
};

//only registered users can login
regd_users.post('/login', (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (!username || !password) {
    return res.status(404).json({ message: 'Error logging in' });
  }

  if (authenticatedUser(username, password)) {
    let accessToken = jwt.sign(
      {
        data: password,
      },
      'access',
      { expiresIn: 60 * 60 }
    );

    req.session.authorization = {
      accessToken,
      username,
    };
    return res.status(200).send('User successfully logged in');
  } else {
    return res
      .status(208)
      .json({ message: 'Invalid Login. Check username and password' });
  }
});

// Add a book review
regd_users.put('/auth/review/:isbn', (req, res) => {
  const isbn = req.params.isbn;
  const review = req.query.review;
  const username = req.session.authorization.username;

  if (!isbn || !review || !username) {
    return res.status(400).json({
      message: 'Bad request. ISBN, review, and username are required.',
    });
  }

  if (!books[isbn]) {
    return res.status(404).json({ message: 'Book not found.' });
  }

  // Initialize reviews array if not present
  if (!books[isbn].reviews) {
    books[isbn].reviews = [];
  }

  const existingReviewIndex = books[isbn].reviews.findIndex(
    (r) => r.username === username
  );

  if (existingReviewIndex !== -1) {
    // Modify the existing review by the same user
    books[isbn].reviews[existingReviewIndex].review = review;
  } else {
    // Add a new review by the current user
    books[isbn].reviews.push({ username, review });
  }

  return res
    .status(200)
    .json({ message: 'Review added/modified successfully.' });
});

regd_users.delete('/auth/review/:isbn', (req, res) => {
  const isbn = req.params.isbn;
  const username = req.session.authorization.username;

  if (!isbn || !username) {
    return res.status(400).json({
      message: 'Bad request. ISBN and username are required.',
    });
  }

  if (!books[isbn]) {
    return res.status(404).json({ message: 'Book not found.' });
  }

  if (!books[isbn].reviews) {
    return res.status(404).json({ message: 'No reviews to delete.' });
  }

  const reviewIndexToDelete = books[isbn].reviews.findIndex(
    (r) => r.username === username
  );

  if (reviewIndexToDelete !== -1) {
    // Delete the review by the same user
    books[isbn].reviews.splice(reviewIndexToDelete, 1);
  } else {
    return res.status(404).json({ message: 'No reviews to delete.' });
  }

  return res.status(200).json({ message: 'Review deleted successfully.' });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
