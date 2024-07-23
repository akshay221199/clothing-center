import mongoose from "mongoose";

const MongoUrl = "mongodb://localhost:27017/clothcenter";

const connectToMongo = async () => {
    try {
        await mongoose.connect(MongoUrl);
        console.log("Successfully Connected To Mongo");
    } catch (err) {
        console.log(err);
    }
};

export default connectToMongo;
