class ApiResponse {
    constructor(statusCode, data, message = "Success") {
        this.statusCode = statusCode;  // HTTP status code (e.g., 200, 400)
        this.data = data;              // The response payload
        this.message = message;        // A success/failure message
        this.success = statusCode < 400; // Determines if it’s a success
    }
    send(res) {
        return res.status(this.statusCode).json(this);
    }
}
export default ApiResponse;
