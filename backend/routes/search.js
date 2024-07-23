import express from 'express';
import Product from '../models/Product.js';
const router = express.Router();

router.get('/searchProduct', async (req, res) => {
    try {
        const query = req.query.query.toLowerCase();

        // Fetch products from the database
        const products = await Product.find();

        // Filter products based on the search query
        const results = products.filter(product =>
            product.name.toLowerCase().includes(query) ||
            product.category.toLowerCase().includes(query)
        );

        // Send the filtered results as JSON
        res.json(results);
    } catch (error) {
        // Handle any errors that occur during the search
        res.status(500).json({ error: 'An error occurred while searching for products.' });
    }
});

export default router;
