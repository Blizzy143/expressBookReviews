const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session');
const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;




const app = express();

app.use(express.json());

// Session middleware setup (only for /customer routes)
app.use("/customer", session({
    secret: "fingerprint_customer",
    resave: true,
    saveUninitialized: true
}));

// 🔐 Apply authentication only to protected routes (fixing public access issue)
app.use("/customer/auth/*", function auth(req, res, next) {
    if (!req.session || !req.session.token) {
        return res.status(401).json({ message: "Unauthorized: No token provided" });
    }

    const token = req.session.token;

    jwt.verify(token, "fingerprint_customer", (err, decoded) => {
        if (err) {
            return res.status(403).json({ message: "Forbidden: Invalid token" });
        }
        
        req.user = decoded;
        next();
    });
});

app.use("/customer", customer_routes);
app.use("/", genl_routes);
const PORT = 5000;



app.listen(PORT, () => console.log("📡 Server is running on port 5000"));