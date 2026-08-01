import { config } from '../config/config.js';
import { createOrderOnRazorpay } from '../services/payment.service.js';
import { sendResponse } from '../utils/response.utlis.js';
import { validatePaymentVerification } from 'razorpay/dist/utils/razorpay-utils.js';
import { findPaymentByOrderId, updatePaymentStatus, createPaymentRecord } from '../dao/payment.dao.js';
import { getFormattedCart, clearCart } from '../dao/cart.dao.js';
import { decrementProductVariantStock } from '../dao/product.dao.js';
import { createOrders } from '../dao/order.dao.js';
import mongoose from 'mongoose';

const createPaymentOrderController = async (req, res) => {
    try {
        const { amount, currency } = req.body;

        const razorpayOrder = await createOrderOnRazorpay({ amount, currency });

        const paymentOrder = await createPaymentRecord({
            razorpay: {
                orderId: razorpayOrder.id,
            },
            user: req.user._id,
            price: {
                amount: razorpayOrder.amount,
                currency: razorpayOrder.currency,
            },
            status: 'pending',
        });

        return await sendResponse({
            res,
            statusCode: 200,
            message: 'Order created successfully',
            success: true,
            razorpayOrder,
        });
    } catch (error) {
        console.error(error);
        return await sendResponse({
            res,
            statusCode: 500,
            message: 'Failed to create order',
            success: false,
            error: error.message,
        });
    }
};

const verifyPaymentOrderController = async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, addressId } =
            req.body;

        const isPaymentValid = validatePaymentVerification(
            {
                order_id: razorpay_order_id,
                payment_id: razorpay_payment_id,
            },
            razorpay_signature,
            config.RAZORPAY_KEY_SECRECT,
        );

        if (!isPaymentValid) {
            await updatePaymentStatus(razorpay_order_id, { status: 'failed' });

            return await sendResponse({
                res,
                statusCode: 400,
                message: ' Payment verification failed',
                success: false,
            });
        }

        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            const paymentOrder = await findPaymentByOrderId(razorpay_order_id, session);

            if (!paymentOrder) {
                await session.abortTransaction();
                session.endSession();
                return await sendResponse({
                    res,
                    statusCode: 404,
                    message: 'Payment order not found',
                    success: false,
                });
            }

            // Retrieve aggregated cart within session
            const cart = await getFormattedCart(paymentOrder.user, session);
            if (!cart || !cart.items || cart.items.length === 0) {
                await session.abortTransaction();
                session.endSession();
                return await sendResponse({
                    res,
                    statusCode: 400,
                    message: 'Cart is empty. Cannot place order.',
                    success: false,
                });
            }

            const itemsBySeller = {};
            for (const item of cart.items) {
                const updatedProduct = await decrementProductVariantStock(
                    item.product._id,
                    item.variant,
                    item.quantity,
                    session
                );

                if (!updatedProduct) {
                    throw new Error(`Insufficient stock for product: ${item.product.title}`);
                }

                const sellerId = item.product.seller.toString();
                const price = item.product.variants.price || item.product.price;

                if (!itemsBySeller[sellerId]) {
                    itemsBySeller[sellerId] = {
                        items: [],
                        totalAmount: 0,
                        currency: price.currency,
                    };
                }

                itemsBySeller[sellerId].items.push({
                    product: item.product._id,
                    variant: item.variant,
                    quantity: item.quantity,
                    price: {
                        amount: price.amount,
                        currency: price.currency,
                    },
                });

                itemsBySeller[sellerId].totalAmount += item.itemSubTotal.amount;
            }

            const createdOrders = [];
            const ordersData = [];

            for (const sellerId of Object.keys(itemsBySeller)) {
                const { items: orderItems, totalAmount, currency } = itemsBySeller[sellerId];
                ordersData.push({
                    user: paymentOrder.user,
                    seller: sellerId,
                    items: orderItems,
                    totalPrice: {
                        amount: totalAmount,
                        currency,
                    },
                    payment: paymentOrder._id,
                    address: addressId || null,
                    status: 'paid',
                });
            }

            const results = await createOrders(ordersData, session);
            createdOrders.push(...results);

            paymentOrder.status = 'paid';
            paymentOrder.razorpay.paymentId = razorpay_payment_id;
            paymentOrder.razorpay.signature = razorpay_signature;
            await paymentOrder.save({ session });

            await clearCart(paymentOrder.user, session);

            await session.commitTransaction();
            session.endSession();

            return await sendResponse({
                res,
                statusCode: 200,
                message: 'Payment verified and orders placed successfully',
                success: true,
                orders: createdOrders,
                paymentOrder,
            });
        } catch (error) {
            await session.abortTransaction();
            session.endSession();

            console.error('Checkout transaction failed, aborting:', error);

            // Mark payment status failed outside the transaction session to preserve the paid trail
            await updatePaymentStatus(razorpay_order_id, {
                status: 'failed',
                'razorpay.paymentId': razorpay_payment_id,
                'razorpay.signature': razorpay_signature,
            });

            return await sendResponse({
                res,
                statusCode: 400,
                message: error.message || 'Verification and checkout failed.',
                success: false,
            });
        }
    } catch (error) {
        console.error(error);
        return await sendResponse({
            res,
            statusCode: 500,
            message: 'Failed to verify payment order',
            success: false,
            error: error.message,
        });
    }
};

export { createPaymentOrderController, verifyPaymentOrderController };

