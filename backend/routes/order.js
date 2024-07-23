import express from 'express';
import mongoose from 'mongoose';
import Cart from '../models/Cart.js';
import userMiddleware from '../middleware/userMiddleware.js';
import Product from '../models/Product.js';

const router = express.Router();

router.get('/order-data', userMiddleware, async (req, res) => {
  try {
      const adminId = req.user.id;
      // console.log('admin id is',adminId);
      // Get all products uploaded by the admin
      const adminProducts = await Product.find({ adminId });
      // console.log(adminProducts);
      // Get all cart items that include products uploaded by this admin
      const adminProductIds = adminProducts.map(product => product._id);
      // console.log('the admin product id is', adminProductIds);
      const cartData = await Cart.find({ productId: { $in: adminProductIds }, status: { $ne: 'delivered' } }).populate('productId').populate('userId');
      // console.log('ur cart data is',cartData);
      res.json(cartData);
  } catch (error) {
      res.status(500).send('Server error');
  }
});

router.put('/updateStatus/:id', userMiddleware, async (req, res) => {
    const { status } = req.body;
    const validStatuses = ['pending', 'delivering', 'delivered'];
  
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ msg: 'Invalid status' });
    }
  
    try {
      const order = await Cart.findById(req.params.id);
      if (!order) {
        return res.status(404).json({ msg: 'Order not found' });
      }
      console.log(order);
      if (req.user.userType !== 'admin') {
        return res.status(403).json({ msg: 'Unauthorized action' });
      }
  
      order.status = status;
      await order.save();
      res.json(order);
    } catch (error) {
      console.error('Server error:', error);
      res.status(500).json({ msg: 'Server error' });
    }
  });
  
  router.put('/updateUserStatus/:id', userMiddleware, async (req, res) => {
    const { status } = req.body;
    const validStatuses = ['pending', 'delivering', 'delivered'];

    if (!validStatuses.includes(status)) {
        return res.status(400).json({ msg: 'Invalid status' });
    }

    try {
        const order = await Cart.findById(req.params.id);
        if (!order) {
            return res.status(404).json({ msg: 'Order not found' });
        }
        
        // Assuming `req.user.id` contains the ID of the logged-in user
        if (order.userId.toString() !== req.user.id) {
            return res.status(403).json({ msg: 'Unauthorized action' });
        }

        order.status = status;
        await order.save();
        res.json(order);
    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ msg: 'Server error' });
    }
});



// only delivered products can see


router.get('/order-datas', userMiddleware, async (req, res) => {
  try {
      const adminId = req.user.id;
      // console.log('admin id is',adminId);
      // Get all products uploaded by the admin
      const adminProducts = await Product.find({ adminId });
      // console.log(adminProducts);
      // Get all cart items that include products uploaded by this admin
      const adminProductIds = adminProducts.map(product => product._id);
      // console.log('the admin product id is', adminProductIds);
      const cartData = await Cart.find({ productId: { $in: adminProductIds }, status: { $in: 'delivered' } }).populate('productId').populate('userId');
      // console.log('ur cart data is',cartData);
      res.json(cartData);
  } catch (error) {
      res.status(500).send('Server error');
  }
});

export default router;