import mongoose from 'mongoose';
const { Schema } = mongoose;

const ProductSchema = new Schema({
    adminId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        require: true
    },
    name: {
        type: String,
        require: true
    },
    category: {
        type: String,
        require: true
    },
    price: {
        type: Number,
        require: true
    },
    color: {
        type: String,
        require: false
    },
    description: {
        type: String,
        require: true
    },
    stocks: {
        type: Number,
        require: true
    },
    image: {
        type: String,
        require: true
    },
    date: {
        type: Date,
        default: Date.now
    }

});

export default mongoose.model('Product', ProductSchema);