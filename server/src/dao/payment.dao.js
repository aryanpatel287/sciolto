import paymentModel from '../models/payment.model.js';

export const findPaymentByOrderId = async (orderId, session) => {
    const options = session ? { session } : {};
    return await paymentModel.findOne({ 'razorpay.orderId': orderId }, null, options);
};

export const updatePaymentStatus = async (orderId, updateData, session) => {
    const query = { 'razorpay.orderId': orderId };
    const options = session ? { session, new: true } : { new: true };
    return await paymentModel.findOneAndUpdate(query, updateData, options);
};

export const createPaymentRecord = async (paymentData, session) => {
    const options = session ? { session, ordered: true } : {};
    const [created] = await paymentModel.create([paymentData], options);
    return created;
};

