import { model, Schema } from "mongoose";

const contactSchema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    email: {
        type: String,
        trim: true,
        default: null,
    },
    phone: {
        type: String,
        required: true,
        trim: true,
    },
    productName: {
        type: String,
        trim: true,
        default: null,
    },
    message: {
        type: String,
        required: true,
        trim: true,
    },
}, {
    timestamps: true,
    virtuals: true,
    toJSON: {
        virtuals: true,
        getters: true
    },
    toObject: {
        virtuals: true,
        getters: true
    },
})

const contactModel = model('contact', contactSchema)

export default contactModel
