import mongoose from 'mongoose';
import priceSchema from './price.schema.js';

const itemSchema = new mongoose.Schema(
    {
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'products',
            required: true,
        },
        variant: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'products.variants',
        },
        quantity: {
            type: Number,
            default: 1,
            required: true,
        },
        price: {
            type: priceSchema,
            required: true,
        },
    },
    {
        _id: false,
        _v: false,
    },
);

export default itemSchema;
