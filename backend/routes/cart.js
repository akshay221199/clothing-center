import express from 'express';
import Cart from '../models/Cart.js';
import { body, validationResult } from "express-validator";
import Product from '../models/Product.js';
import userMiddleware from '../middleware/userMiddleware.js';
const router = express.Router();
import User from '../models/User.js'

router.post('/addToCart', async (req, res) => {

    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json('something errror');
        }
        const cartItem = Cart.create({
            userId: req.body.userId,
            productId: req.body.productId,
            quantity: req.body.quantity,
        });        
      res.json(cartItem);  

    } catch (error) {
        console.error('catch error');
        return res.status(401).json('Server issue');
    }
});

router.get('/getCartProduct',userMiddleware,  async(req, res)=>{
    try {
        // @ts-ignore
        
        const cartData = await Cart.find({ userId: req.user.id }).populate('productId');
        return res.json(cartData)
    } catch (error) {
        console.error('catch error');
        return res.status(401).json('Server issue');
    }   
});


router.delete('/deleteCartProduct/:id', userMiddleware, async (req, res) => {
    try {
        const userId = req.params.id;

        const cartDeleteData = await Cart.findById(req.params.id);

        if (!cartDeleteData) {
            return res.status(404).json({ message: 'Product Not Found' });
        }

        // Authorization check
        // if (cartDeleteData.userId.toString() !== userId.toString()) {
        //     return res.status(403).json({ message: 'Not Allowed' });
        // }

        await Cart.findByIdAndDelete(req.params.id);
        res.json({ message: 'Deleted product successfully', cartDeleteData });
    } catch (error) {
        console.error('Error deleting product:', error); // Log the actual error
        return res.status(500).json({ message: 'Server issue' });
    }
});

router.put('/updateStatus/:id', userMiddleware, async (req, res) => {
    const { status } = req.body;
    const validStatuses = ['delivering', 'delivered'];
  
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ msg: 'Invalid status' });
    }
  
    try {
      const cart = await Cart.findById(req.params.id);
      if (!cart) {
        return res.status(404).json({ msg: 'Cart not found' });
      }
  
      // Check if the user is admin and updating status to delivering
      if (req.user.role === 'admin' && cart.status === 'pending' && status === 'delivering') {
        cart.status = status;
      }
      // Check if the user is user and updating status to delivered
      else if (req.user.role === 'user' && cart.status === 'delivering' && status === 'delivered') {
        cart.status = status;
      } else {
        return res.status(403).json({ msg: 'Unauthorized action or invalid status transition' });
      }
  
      await cart.save();
      res.json(cart);
    } catch (error) {
      res.status(500).send('Server error');
    }
  });


  router.get('/updateProuctStatus', userMiddleware, async (req, res) => {
    const { status } = req.body;
   
  
    try {
      const cart = await Cart.findById(req.params.id);
      if (!cart) {
        return res.status(404).json({ msg: 'Cart not found' });
      }
  
      // Check if the user is admin and updating status to delivering
      if (req.user.role === 'admin' && cart.status === 'pending' && status === 'delivering') {
        cart.status = status;
      }
      // Check if the user is user and updating status to delivered
      else if (req.user.role === 'user' && cart.status === 'delivering' && status === 'delivered') {
        cart.status = status;
      } else {
        return res.status(403).json({ msg: 'Unauthorized action or invalid status transition' });
      }
  
      await cart.save();
      res.json(cart);
    } catch (error) {
      res.status(500).send('Server error');
    }
  });


export default router;