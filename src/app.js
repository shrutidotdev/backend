import express, { urlencoded } from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
import useRouter from "./routes/user.router.js"

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
app.use(cookieParser())

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

// Defining routers
app.use('/api/users', useRouter)

export default app