// const connectDatabase = async() => {
//     try {
//         await mongoose.connect(process.env.MONGO_URI)
//     } catch (error) {
//         console.error("Error while connecting to database", error.message)
//     }
// }

//Via IFEE

    // IFEE Approch
    ; (async () => {
        try {
            await mongoose.connect(`${process.env.MONGO_URI}/${process.env.DB_NAME}`)
            console.log("🚀Successfully connected The database")
            app.on("error", (e) => {
                console.log("ERROR: ", e)
                throw error
            })
            
        } catch (error) {
            console.error("Error while connecting to mongodb database", error?.message)
        }
    })()