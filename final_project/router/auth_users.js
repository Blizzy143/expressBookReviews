const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
let users = []
const regd_users = express.Router();

const SECRET_KEY = "fingerprint_customer";

const isValid = (username)=>{ //returns boolean
//write code to check is the username is valid
}

const authenticatedUser = (username,password)=>{ //returns boolean
//write code to check if username and password match the one we have in records.
}

//only registered users can login
regd_users.post("/login", (req, res) => {
    console.log("Users in memory before login attempt:", users); // ✅ Debugging Step

    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
    }

    const user = users.find(u => u.username === username && u.password === password);
    if (!user) {
        return res.status(401).json({ message: "Invalid username or password" });
    }

    const token = jwt.sign({ username }, SECRET_KEY, { expiresIn: '1h' });
    req.session.token = token;

    return res.status(200).json({ message: "Login successful", token });
});
regd_users.put("/auth/review/:isbn", (req, res) => {
    console.log("Session Token Received:", req.session.token);
    const isbn = req.params.isbn; // Extract ISBN from request parameters
    const { review } = req.body;  // Extract review

    // 1️⃣ Ensure the user is authenticated
    if (!req.session || !req.session.token) {
        return res.status(401).json({ message: "Unauthorized: Please log in first" });
    }

    // 2️⃣ Verify the JWT Token
    jwt.verify(req.session.token, SECRET_KEY, (err, decoded) => {
        if (err) {
            return res.status(403).json({ message: "Forbidden: Invalid token" });
        }

        const username = decoded.username; // Extract username from token

        // 3️⃣ Check if book exists
        if (!books[isbn]) {
            return res.status(404).json({ message: "Book not found" });
        }

        // 4️⃣ Ensure the book has a reviews object
        if (!books[isbn].reviews) {
            books[isbn].reviews = {};
        }

        // 5️⃣ Add or Modify the Review
        books[isbn].reviews[username] = review;

        return res.status(200).json({ message: "Review added/updated successfully", reviews: books[isbn].reviews });
    });
});

regd_users.delete("/auth/review/:isbn", (req, res) => {
    console.log("Session Token Received in Delete Review Route:", req.session?.token); // ✅ Debugging

    if (!req.session || !req.session.token) {
        return res.status(401).json({ message: "Unauthorized: Please log in first" });
    }

    jwt.verify(req.session.token, SECRET_KEY, (err, decoded) => {
        if (err) {
            return res.status(403).json({ message: "Forbidden: Invalid token" });
        }

        const username = decoded.username; // Extract username from token
        const isbn = req.params.isbn; // Extract ISBN

        // Check if book exists
        if (!books[isbn]) {
            return res.status(404).json({ message: "Book not found" });
        }

        // Check if the user has a review
        if (!books[isbn].reviews || !books[isbn].reviews[username]) {
            return res.status(404).json({ message: "Review not found for this user" });
        }

        // Delete the user's review
        delete books[isbn].reviews[username];

        return res.status(200).json({ message: "Review deleted successfully", reviews: books[isbn].reviews });
    });
});

module.exports = {
    authenticated: regd_users,
    isValid,
    users
};
