import mongoose from "mongoose";

const { Schema } = mongoose;

const CartSchema = new Schema({

    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        require: true
    },
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        require: true
    },
    quantity: {
        type: String,
        require: true
    },
    status: {
        type: String,
        enum: ['pending', 'delivering', 'delivered'],
        default: 'pending'
    },
    date: {
        type: Date,
        default: Date.now
    }

});

export default mongoose.model('Cart', CartSchema);