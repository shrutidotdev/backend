import express from "express"
import dotenv from "dotenv"

dotenv.config() 

const app = express()
app.use()

app.get("/", ( req, res ) => {
    res.send("YoU k;guiwgeui")
})

console.log(process.env.PORT)
const port = process.env.PORT || 4000

app.listen(port, () => {
    console.log(`The app is listening on Port ${port}`)
})