const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const db = require('../config/database');

// GET /auth/signup - Display the signup page
router.get('/signup', (req, res) => {
    res.render('auth/signup', { title: 'Create Account', messages: req.flash() });
});

// POST /auth/signup - Handle user registration
router.post('/signup', async (req, res) => {
    const { name, email, password } = req.body;

    try {
        // Check if user already exists
        const [users] = await db.query('SELECT email FROM users WHERE email = ?', [email]);
        if (users.length > 0) {
            req.flash('error', 'User with this email already exists.');
            return res.redirect('/auth/signup');
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 12);

        // Insert the new user into the database
        await db.query('INSERT INTO users (username, email, password) VALUES (?, ?, ?)', [name, email, hashedPassword]);

        console.log('User registered successfully!');
        // Redirect to the login page after successful registration
        res.redirect('/auth/login'); // Assuming you have a login route

    } catch (err) {
        console.error('Error during registration:', err);
        res.status(500).send('Server Error');
    }
});


// GET /auth/login - Display the login page
router.get('/login', (req, res) => {
    res.render('auth/login', { title: 'Login', messages: req.flash() });
});

// POST /auth/login - Handle user login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        // Fetch user from the database
        const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        if (users.length === 0) {
            req.flash('error', 'Invalid email or password.');
            return res.redirect('/auth/login');
        }

        const user = users[0];

        // Compare the provided password with the stored hashed password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            req.flash('error', 'Invalid email or password.');
            return res.redirect('/auth/login');
        }

        // Store user information in the session
        req.session.isLoggedIn = true;
        req.session.user = user;
        
        // Redirect to a protected route, for example, the products page
        res.redirect('/products');

    } catch (err) {
        console.error('Error during login:', err);
        res.status(500).send('Server Error');
    }
});

// GET /auth/logout - Handle user logout
router.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            console.log('Error destroying session:', err);
            return res.redirect('/'); // Or handle the error appropriately
        }
        res.redirect('/auth/login');
    });
});

module.exports = router;