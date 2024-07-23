import express from 'express';
import Product from '../models/Product.js';
import { body, validationResult } from 'express-validator';
import userMiddleware from '../middleware/userMiddleware.js'
import { useImperativeHandle } from 'react';

const router = express.Router();


// upload the products

router.post('/productform', userMiddleware, [
    body('name', 'Enter a name').exists(),
    body('category', 'Enter category Name').exists(),
    body('price', 'Enter a price').isNumeric(),
    body('color', 'Enter a color').exists(),
    body('description', 'Enter description').isLength({ min: 5 }),
    body('stocks', 'Enter a stocks').isNumeric(),
    body('image', 'Upload product').exists(),
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json('something went wrong');
    }

    try {
        let product = await Product.create({
            name: req.body.name,
            category: req.body.category,
            price: req.body.price,
            color: req.body.color,
            description: req.body.description,
            stocks: req.body.stocks,
            image: req.body.image,
            adminId: req.user.id
        });

        const productData = {
            product: {
                id: product._id,
            }
        }
        // return res.json({productData});
        return res.json({ product });

    } catch (error) {
        return res.status(400).json('server issue');
    }

});

// show product to home Page all the products

router.get('/getProduct', async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 8;

    try {
        const totalProducts = await Product.countDocuments();
        const totalPages = Math.ceil(totalProducts / limit);
        const products = await Product.find()
            .skip((page - 1) * limit)
            .limit(limit);

        res.json({
            products,
            totalPages,
            totalResults: totalProducts
        });
    } catch (error) {
        console.error('Server issue', error);
        res.status(500).json({ message: 'Server issue' });
    }
});

// only a admin who posted product can see his own product not  others
router.get('/getProducts', userMiddleware, async (req, res) => {

    try {

        const product = await Product.find({ adminId: req.user.id });
        res.json(product);

    } catch (error) {
        return res.status(400).json('server issue');
        console.error('server issue');
    }

});

// For detailed product
router.get('/getProduct/:id', async (req, res) => {

    try {
        const productId = req.params.id;
        const product = await Product.findById(productId);
        res.json(product);

    } catch (error) {
        return res.status(400).json('server issue');
        console.error('server issue');
    }

});

// Delete product by  admin thier own uploaded product

router.delete('/deleteProduct/:id', userMiddleware, async (req, res) => {
    try {
        const productId = req.params.id;
        const userId = req.user.id;

        // Log incoming request details
        // console.log(`Received request to delete product ID: ${productId} by user ID: ${userId}`);

        const product = await Product.findById(productId);
        if (!product) {
            console.log(`Product not found: ${productId}`);
            return res.status(404).json({ message: 'Product Not Found' });
        }

        // Check if product.adminId is defined
        if (!product.adminId) {
            console.error(`adminId is missing in product: ${productId}`);
            return res.status(400).json({ message: 'Product data is corrupt or incomplete' });
        }

        if (product.adminId.toString() !== userId) {
            console.log(`User ${userId} is not authorized to delete product ${productId}`);
            return res.status(403).json({ message: 'Not Allowed' });
        }

        await Product.findByIdAndDelete(productId);
        console.log(`Product deleted: ${productId}`);
        res.json({ message: 'Deleted Product', product });
    } catch (error) {
        console.error(`Server error: ${error.message}`);
        return res.status(500).json({ message: 'Server issue' });
    }
});



// update the products only own product can update addmin not others

router.put('/updateProduct/:id', userMiddleware, async (req, res) => {
    try {
        const adminId = req.user.id;
        console.log(adminId);
        const productId = req.params.id;
        const { name, category, price, color, description, stocks, image } = req.body;
        const updateProduct = {};
        if (name) { updateProduct.name = name };
        if (category) { updateProduct.category= category };
        if (price) { updateProduct.price =price};
        if (color) { updateProduct.color =color};
        if (description) { updateProduct.description =description };
        if (stocks) { updateProduct.stocks =stocks};
        if (image) { updateProduct.image =image};

        const product = await Product.findById(productId);

        if (!product) {
            return res.status(404).json('Not Found');
            console.error('Product Not Found');
        }
        if (!product.adminId) {
            return res.status(404).json('Admin Id not Found');
            console.error('Admin Id not Found');
        }
        if (product.adminId.toString() !== adminId) {
            console.log(`User ${adminId} is not authorized to delete product ${productId}`);
            return res.status(403).json({ message: 'Not Allowed' });
        }
        await Product.findByIdAndUpdate(productId, { $set: updateProduct });
        console.log(`'Product Updated', ${productId}`);
        return res.json({message:'Product Updated', productId});

    } catch (error) {
        console.error(`Server error: ${error.message}`);
        return res.status(500).json({ message: 'Server issue' });
    }
});

// router.get('/getProduct', async (req, res) => {
//     const page = parseInt(req.query.page) || 1;
//     const limit = parseInt(req.query.limit) || 8;
//     const startIndex = (page - 1) * limit;
//     const totalProducts = await Product.countDocuments();
//     const totalPages = Math.ceil(totalProducts / limit);

//     const products = await Product.find().skip(startIndex).limit(limit);

//     res.json({
//         products,
//         totalPages
//     });
// });


export default router;
