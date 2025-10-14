const express = require('express');
const router = express.Router();
const db = require('../config/database');

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

// Route to handle the form submission to add a new product
router.post('/add', async (req, res) => {
    const { name, price, description, image } = req.body;
    try {
                await db.query('INSERT INTO products (name, price, description, image) VALUES (?, ?, ?, ?)', [name, price, description, image]);
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

// Route to handle the form submission to update a product
router.post('/edit/:id', async (req, res) => {
    const { id } = req.params;
    const { name, price, description, image } = req.body;
    try {
        await db.query('UPDATE products SET name = ?, price = ?, description = ?, image = ? WHERE id = ?', [name, price, description, image, id]);
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
