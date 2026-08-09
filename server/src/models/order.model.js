import mongoose from 'mongoose';
import itemSchema from './item.schema.js';
import priceSchema from './price.schema.js';

const orderSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'users',
            required: true,
        },
        seller: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'users',
            required: true,
        },
        items: {
            type: [itemSchema],
        },
        totalPrice: {
            type: priceSchema,
            required: true,
        },
        payment: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'payments',
        },
        address: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'addresses',
        },
        status: {
            type: String,
            enum: ['pending', 'paid', 'failed'],
            default: 'pending',
        },
    },
    { timestamps: true },
);

const orderModel = mongoose.model('orders', orderSchema);

export default orderModel;
