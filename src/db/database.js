import mongoose from "mongoose";

const connectDatabase = async () => {
  try {
    const connectionInstance = await mongoose.connect(process.env.MONGO_URI);
    console.log("🚀 Successfully connected to the database");
    console.log(`📌 Host: ${connectionInstance.connection.host}`);
    console.log(`📌 Database: ${connectionInstance.connection.name}`);
  } catch (error) {
    console.error("❌ Problem while connecting to database:", error);
    process.exit(1);
  }
};

export default connectDatabase;
// console.log(`📌 Host: ${connectionInstance.connection.host}`);
// console.log(`📌 Name: ${connectionInstance.connection.name}`);
// console.log(`📌 readyState: ${connectionInstance.connection.readyState}`);
