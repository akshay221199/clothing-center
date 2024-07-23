import User from "../models/User.js";
import express from 'express';
import bcryptjs from 'bcryptjs';
import JWT from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import userMiddleware from '../middleware/userMiddleware.js'

const router = express.Router();
const JWT_SEC = 'you are a user';

router.post('/userform', [
    body('name', 'Enter a Name'),
    body('contact', 'Enter a valid Contact Number').isNumeric(),
    body('email', 'Enter a Email').isEmail(),
    body('userType', 'Enter type of user').isString(),
    body('password', 'Enter a Password').isLength({ min: 7 })
], async (req, res) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        let userz = await User.findOne({ email: req.body.email, contact: req.body.contact });

        if (userz) {
            return res.status(400).json('User already registerd');
        }
        const salt = await bcryptjs.genSalt(10);
        const hashedPass = await bcryptjs.hash(req.body.password, salt);

        userz = await User.create({

            name: req.body.name,
            contact: req.body.contact,
            email: req.body.email,
            userType: req.body.userType,
            password: hashedPass
        });

        const data = {
            users: {
                id: userz._id,
                userType: userz.userType
            }
        }


        const authtoken = JWT.sign(data, JWT_SEC);
        res.json({ authtoken, userz });


    } catch (error) {
        return res.status(404).json({ errors: errors.array() });
    }

});


router.post('/login', [
    body('email', 'Enter a valid username').isEmail(),
    body('password', 'Enter a password').exists(),
], async (req, res) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.error('Error while login');
    }
    const { id, email, password } = req.body;

    try {

        let userCheck = await User.findOne({ email });
        if (!userCheck) {
            return res.status(404).json('Invalid credentials');
        }
        // @ts-ignore
        const passCheck = await bcryptjs.compare(password, userCheck.password);
        if (!passCheck) {
            return res.status(404).json('Invalid credentials');
        }

        const logData = {
            user: {
                id: userCheck._id,
                userType: userCheck.userType
            }
        }

       

        const authtoken = JWT.sign(logData, JWT_SEC);
        console.log('authtoken');
        return res.json({ authtoken, userId: userCheck._id, userType: userCheck.userType })

    } catch (error) {
        return res.status(400).json('Error while Authentication');
    }

});


router.get('/profile', userMiddleware, async (req, res) => {
    try {
        const userDetails = await User.findById(req.user.id).select('-password');
        if (!userDetails) {
            return res.json('User Not Found');
        }
        res.json(userDetails);
    } catch (error) {
        console.error(error);
        res.status(500).send("Server error");
    }
});

router.put('/updateProfile/:id', userMiddleware, async (req, res) => {
    try {
        const { name, contact, email } = req.body;
        const updatedUser = {};
        if (name) { updatedUser.name = name };
        if (contact) { updatedUser.contact = contact };
        if (email) { updatedUser.email = email };

        let user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json('Not Found');
        }
        if (user._id.toString() !== req.user.id) {
            return res.status(404).json('Not Allowed');
        }
        user = await User.findByIdAndUpdate(req.params.id, { $set: updatedUser }, { new: true });
        res.json(user)
    } catch (error) {
        res.status(401).json('server issue');
    }
});


export default router;