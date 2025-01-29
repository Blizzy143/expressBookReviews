const express = require('express');
let books = require("./booksdb.js");
const { users } = require("./auth_users.js");

const public_users = express.Router();


public_users.post('/register', (req, res) => {
    const { username, password } = req.body;

    // Validate input
    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
    }

    //  Check if username already exists
    if (users.some(user => user.username === username)) {
        return res.status(409).json({ message: "Username already exists" });
    }

    //  Register new user
    users.push({ username, password });

    return res.status(201).json({ message: "User registered successfully" });
});

// Get the book list available in the shop
public_users.get('/', function (req, res) {
    return res.status(200).json({ books: books });
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', function (req, res) {
    const isbn = req.params.isbn; // Extract ISBN from request parameters

    if (books[isbn]) {
        return res.status(200).json(books[isbn]); // Return book details if ISBN exists
    } else {
        return res.status(404).json({ message: "Book not found" }); // Handle case where ISBN does not exist
    }
});
  
// Get book details based on author
public_users.get('/author/:author', function (req, res) {
    const author = req.params.author.toLowerCase(); // Convert to lowercase for case-insensitive search
    const matchingBooks = [];

    // Iterate through books to find matches
    Object.keys(books).forEach(isbn => {
        if (books[isbn].author.toLowerCase() === author) {
            matchingBooks.push({ isbn, ...books[isbn] });
        }
    });

    // Return the filtered list
    if (matchingBooks.length > 0) {
        return res.status(200).json(matchingBooks);
    } else {
        return res.status(404).json({ message: "No books found for this author" });
    }
});

// Get all books based on title
public_users.get('/title/:title', function (req, res) {
    const title = req.params.title.toLowerCase(); // Convert to lowercase for case-insensitive search
    let matchingBooks = [];

    // Iterate through books to find matches
    Object.keys(books).forEach(isbn => {
        if (books[isbn].title.toLowerCase() === title) {
            matchingBooks.push({ isbn, ...books[isbn] });
        }
    });

    // Return the filtered list
    if (matchingBooks.length > 0) {
        return res.status(200).json(matchingBooks);
    } else {
        return res.status(404).json({ message: "No books found with this title" });
    }
});

//  Get book review
public_users.get('/review/:isbn', function (req, res) {
    const isbn = req.params.isbn; // Extract ISBN from request parameters

    if (books[isbn]) {
        return res.status(200).json({ reviews: books[isbn].reviews });
    } else {
        return res.status(404).json({ message: "Book not found" });
    }
});
module.exports.general = public_users;
