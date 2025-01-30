const express = require('express');
let books = require("./booksdb.js");
const axios = require('axios');
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
public_users.get('/', function (req, res) {
    return res.status(200).json(books);  // ✅ Ensure it returns the books
});
// Get the book list available in the shop
public_users.get('/books/promise', (req, res) => {
    new Promise((resolve, reject) => {
        if (books) {
            resolve(books);
        } else {
            reject("No books available");
        }
    })
    .then((books) => res.status(200).json(books))
    .catch((err) => res.status(500).json({ message: err }));
});

// 📚 Get the book list using Async-Await with Axios
public_users.get('/books/async', async (req, res) => {
    try {
        const response = await axios.get("http://localhost:5000/");
        return res.status(200).json(response.data);
    } catch (error) {
        return res.status(500).json({ message: "Error fetching books", error: error.message });
    }
});

// Get book details based on ISBN
public_users.get('/books/isbn/async/:isbn', async (req, res) => {
    try {
        const isbn = req.params.isbn;
        const response = await axios.get(`http://localhost:5000/isbn/${isbn}`); 
        return res.status(200).json(response.data);
    } catch (error) {
        return res.status(404).json({ message: "Error fetching book details", error: error.message });
    }
});
public_users.get('/isbn/:isbn', function (req, res) {
    const isbn = req.params.isbn; // Extract ISBN from request parameters

    if (books[isbn]) {
        return res.status(200).json(books[isbn]); // Return book details if ISBN exists
    } else {
        return res.status(404).json({ message: "Book not found" }); // Handle case where ISBN does not exist
    }
});

public_users.get('/books/isbn/promise/:isbn', (req, res) => {
    const isbn = req.params.isbn;

    new Promise((resolve, reject) => {
        if (books[isbn]) {
            resolve(books[isbn]);
        } else {
            reject("Book not found");
        }
    })
    .then((book) => res.status(200).json(book))
    .catch((err) => res.status(404).json({ message: err }));
});

// 📚 Get book details by ISBN using Async-Await with Axios
public_users.get('/books/isbn/async/:isbn', async (req, res) => {
    try {
        const isbn = req.params.isbn;
        const response = await axios.get(`http://localhost:5000/isbn/${isbn}`); // ✅ Fetch from existing route
        return res.status(200).json(response.data);
    } catch (error) {
        return res.status(404).json({ message: "Error fetching book details", error: error.message });
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

public_users.get('/books/author/promise/:author', (req, res) => {
    const author = req.params.author.toLowerCase();

    new Promise((resolve, reject) => {
        const matchingBooks = [];
        Object.keys(books).forEach(isbn => {
            if (books[isbn].author.toLowerCase() === author) {
                matchingBooks.push({ isbn, ...books[isbn] });
            }
        });

        if (matchingBooks.length > 0) {
            resolve(matchingBooks);
        } else {
            reject("No books found for this author");
        }
    })
    .then((books) => res.status(200).json(books))
    .catch((err) => res.status(404).json({ message: err }));
});

// 📚 Get book details by Author using Async-Await with Axios
public_users.get('/books/author/async/:author', async (req, res) => {
    try {
        const author = req.params.author;
        const response = await axios.get(`http://localhost:5000/author/${author}`); // ✅ Calls existing author route
        return res.status(200).json(response.data);
    } catch (error) {
        return res.status(404).json({ message: "Error fetching book details", error: error.message });
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
public_users.get('/books/title/promise/:title', (req, res) => {
    const title = decodeURIComponent(req.params.title.toLowerCase());  // ✅ Decode URL param

    new Promise((resolve, reject) => {
        let matchingBooks = [];
        Object.keys(books).forEach(isbn => {
            if (books[isbn].title.toLowerCase() === title) {
                matchingBooks.push({ isbn, ...books[isbn] });
            }
        });

        if (matchingBooks.length > 0) {
            resolve(matchingBooks);
        } else {
            reject("No books found with this title");
        }
    })
    .then((books) => res.status(200).json(books))
    .catch((err) => res.status(404).json({ message: err }));
});

//  Get book details by Title using Async-Await with Axios
public_users.get('/books/title/async/:title', async (req, res) => {
    try {
        const title = req.params.title;
        const response = await axios.get(`http://localhost:5000/title/${title}`); // ✅ Calls existing title route
        return res.status(200).json(response.data);
    } catch (error) {
        return res.status(404).json({ message: "Error fetching book details", error: error.message });
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
