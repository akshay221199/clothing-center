import connectToMongo from './config.js'
import express from 'express';
import cors from 'cors';
import UserRouter from './routes/user.js';
import ProductRouter from './routes/product.js';
import CartRouter from './routes/cart.js';
import SearchRouter from './routes/search.js';
import OrderRouter from './routes/order.js';

const app = express();

app.use(cors());
const port = 5000;
app.use(express.json({
    origin:["http://localhost:3000", "https://clothing-center.onrender.com"]
}));
connectToMongo();

app.use('/api/user/', UserRouter );
app.use('/api/product/', ProductRouter );
app.use('/api/cart/', CartRouter );
app.use('/api/search/', SearchRouter);
app.use('/api/order/', OrderRouter);


app.listen(port,()=>{
    console.log(`connected to Server ${port}`);
});