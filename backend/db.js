import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

// console.log(process.env.MONGO_URI);

const mongoURI =
  "mongodb+srv://skn8454:oQicRIybwB7EybNn@cluster0.epz3g51.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const connect = async () => {
  try {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(mongoURI, { useNewUrlParser: true });
      console.log("✅ Database Connected");
    } else {
      console.log("Database already connected");
    }
  } catch (error) {
    console.error("Error connecting to the database:", error.message);
  }
};

export default connect;
