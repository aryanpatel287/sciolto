import mongoose, { mongo } from 'mongoose';
import priceSchema from './price.schema.js';

const paymentSchema = new mongoose.Schema(
    {
        status: {
            type: String,
            enum: ['pending', 'paid', 'failed'],
            default: 'pending',
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'users',
            required: true,
        },
        razorpay: {
            orderId: String,
            paymentId: String,
            signature: String,
        },
        price: {
            type: priceSchema,
            required: true,
        },
    },
    { timestamps: true },
);

const paymentModel = mongoose.model('payments', paymentSchema);

export default paymentModel;
