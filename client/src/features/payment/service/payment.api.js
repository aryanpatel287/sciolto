import axios from 'axios';

const paymentApiInstance = axios.create({
    baseURL: '/api/payments',
    withCredentials: true,
});

export const createPaymentOrder = async ({ amount, currency }) => {
    try {
        const response = await paymentApiInstance.post('/create/order', {
            amount,
            currency,
        });
        return response.data;
    } catch (error) {
        console.error('Error creating payment order', error);
        throw error;
    }
};

export const verifyPaymentOrder = async ({
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
}) => {
    try {
        const response = await paymentApiInstance.post('/verify/order', {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
        });
        return response.data;
    } catch (error) {
        console.error('Error verifying payment order', error);
        throw error;
    }
};
