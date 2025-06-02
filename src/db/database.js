import mongoose from "mongoose";

const connectDatabase = async () => {
  try {
    // Save the result of mongoose.connect
    const connectionInstance = await mongoose.connect(`${process.env.MONGO_URI}/${process.env.DB_NAME}`);

    console.log("🚀 Successfully connected to the database");
} catch (error) {
    console.error("❌ Problem while connecting to database:", error);
    process.exit(1);
}
};

export default connectDatabase;
// console.log(`📌 Host: ${connectionInstance.connection.host}`);
// console.log(`📌 Name: ${connectionInstance.connection.name}`);
// console.log(`📌 readyState: ${connectionInstance.connection.readyState}`);
