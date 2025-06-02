import express, { urlencoded } from "express"
import cors from "cors"
import cookieParser from "cookie-parser"

const app = express()
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    methods: ["GET", "POST", "DELETE", "PUT"],
    credentials: true
}))

app.use(express.json({
    limit: "16kb"
}))
app.use(express.urlencoded({ extended: true, limit : "16kb"}))
app.use(express.static("public"))
app.use(express.cookieParser())

app.get("/", (req, res ) => {
    res.send("wlefj")
})
app.get("/me", (req, res) => {
    res.send(
        `<title>Oh hu</title>
        <h1>HJ</h1>
        <p>What's up</p>
        `
    )
})


export default { app }