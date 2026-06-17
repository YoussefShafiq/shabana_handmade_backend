import { model, Schema } from "mongoose";

const ProductSchema = new Schema(
    {
        slug: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },
        name: {
            type: String,
            required: true,
        },
        price: {
            type: Number,
            required: true,
        },
        category: {
            type: Schema.Types.ObjectId,
            ref: 'Category',
            required: true,
        },
        shortDescription: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            required: true,
        },
        materials: {
            type: String,
            required: true,
        },
        size: {
            type: String,
            default: null,
        },
        leadTime: {
            type: String,
            default: null,
        },
        images: {
            type: [String],
            default: [],
        },
        instagramUrl: {
            type: String,
            default: null,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        isNew: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
        virtuals: true,
        toJSON: {
            virtuals: true,
            getters: true,
        },
        toObject: {
            virtuals: true,
            getters: true,
        },
    }
);

const ProductModel = model("Product", ProductSchema);

export default ProductModel;

