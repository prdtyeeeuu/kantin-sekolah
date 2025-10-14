
const express = require('express');
const path = require('path');
const session = require('express-session');
const flash = require('connect-flash');
const methodOverride = require('method-override');
const app = express();
const port = 3000;

// Set EJS as the view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Middleware to parse URL-encoded bodies
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));

// Session and flash middleware
app.use(session({
    secret: 'your-secret-key', // Replace with a real secret key
    resave: false,
    saveUninitialized: false
}));
app.use(flash());

// Routers
const productsRouter = require('./routes/products');
const authRouter = require('./routes/auth');

// Middleware to check if user is authenticated
const isAuthenticated = (req, res, next) => {
    if (req.session.isLoggedIn) {
        return next();
    }
    res.redirect('/auth/login');
};

app.use('/auth', authRouter);
app.use('/products', isAuthenticated, productsRouter);

app.get('/', (req, res) => {
    res.redirect('/products');
});

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
