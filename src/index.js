import dotenv from "dotenv"
import connectDatabase from "./db/database.js"
import app from "./app.js"

dotenv.config()
await connectDatabase()


console.log(process.env.PORT)
const port = process.env.PORT || 4000

app.listen(port, () => {
    console.log(`The app is listening on Port ${port}`)
})