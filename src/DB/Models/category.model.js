import { model, Schema } from "mongoose";

const CategorySchema = new Schema(
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

const CategoryModel = model("Category", CategorySchema);

export default CategoryModel;

