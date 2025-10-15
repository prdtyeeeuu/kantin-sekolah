const express = require('express');
const router = express.Router();
const db = require('../config/database');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directory exists
const imagesDir = path.join(__dirname, '..', 'public', 'images');
if (!fs.existsSync(imagesDir)) {
    fs.mkdirSync(imagesDir, { recursive: true });
}

// Multer storage config
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, imagesDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const safeName = file.originalname.replace(/[^a-z0-9.\-\_]/gi, '_');
        cb(null, uniqueSuffix + '-' + safeName);
    }
});

const fileFilter = (req, file, cb) => {
    // Accept images only
    if (/image\//.test(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Only image files are allowed!'), false);
    }
};

const upload = multer({ storage, fileFilter, limits: { fileSize: 5 * 1024 * 1024 } });

// Route to display all products
router.get('/', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM products');
        res.render('products/index', { products: rows, title: 'Daftar Produk' });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// Route to display the form to add a new product
router.get('/add', (req, res) => {
    res.render('products/add', { title: 'Tambah Produk' });
});

// Route to handle the form submission to add a new product (with file upload)
router.post('/add', upload.single('image'), async (req, res) => {
    const { name, price, description } = req.body;
    // If a file was uploaded, store its public path, otherwise null
    const imagePath = req.file ? `/images/${req.file.filename}` : null;
    try {
        await db.query('INSERT INTO products (name, price, description, image) VALUES (?, ?, ?, ?)', [name, price, description, imagePath]);
        res.redirect('/products');
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// Route to display the form to edit a product
router.get('/edit/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const [rows] = await db.query('SELECT * FROM products WHERE id = ?', [id]);
        if (rows.length === 0) {
            return res.status(404).send('Product not found');
        }
        res.render('products/edit', { product: rows[0], title: 'Edit Produk' });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// Route to handle the form submission to update a product (with optional file upload)
router.post('/edit/:id', upload.single('image'), async (req, res) => {
    const { id } = req.params;
    const { name, price, description } = req.body;
    try {
        // Get current product to preserve image if no new file uploaded
        const [rows] = await db.query('SELECT * FROM products WHERE id = ?', [id]);
        if (rows.length === 0) {
            return res.status(404).send('Product not found');
        }
        const current = rows[0];
        const imagePath = req.file ? `/images/${req.file.filename}` : current.image;

        await db.query('UPDATE products SET name = ?, price = ?, description = ?, image = ? WHERE id = ?', [name, price, description, imagePath, id]);
        res.redirect('/products');
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// Route to handle the deletion of a product
router.delete('/delete/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await db.query('DELETE FROM products WHERE id = ?', [id]);
        res.redirect('/products');
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
