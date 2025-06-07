//const asyncHandler = () => {}
//const asyncHandler = (func) => () => {}
//const asyncHandler = (func) => async() => {}


const asyncHandler = (func) => async (req, res, next) => {
    try {
        await func(req, res, next);
    } catch (error) {
        console.error("Error in asyncHandler::", error); // 👀 See actual error object
        res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || "Internal Server Error",
        });
    }
};

// const asyncHandler = (requestHandler) => {
//  return (req ,res , next) => {
//     Promise.resolve(requestHandler(req , res , next ))
//     .catch((err) => next(err))
//  }
// }
export default asyncHandler



