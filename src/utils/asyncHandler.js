//const asyncHandler = () => {}
//const asyncHandler = (func) => () => {}
//const asyncHandler = (func) => async() => {}


const asyncHandler = (func) => async (req, res, next) => {
    try {
        await func(req, res, next);
    } catch (error) {
        console.error("Caught error:", error); // 👀 See actual error object
        res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || "Something went wrong in handler",
        });
    }
};

// const asyncHandler = (requestHandler) => {
//  return (req ,res , next) => {
//     Promise.resolve(requestHandler(req , res , next ))
//     .catch((err) => next(err))
//  }
// }
export { asyncHandler }



