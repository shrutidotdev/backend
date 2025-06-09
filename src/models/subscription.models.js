import mongoose, { Schema } from "mongoose";

const subscriptionschema = new Schema({
    subscriber: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    channel: {
        type: Schema.Types.ObjectId,
        ref: "User"
    }
}, {timestamps: true});

const Subscription = mongoose.model("Subscription", subscriptionschema)