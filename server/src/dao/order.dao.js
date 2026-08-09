import orderModel from '../models/order.model.js';

export const createOrders = async (ordersData, session) => {
    const options = session ? { session, ordered: true } : {};
    return await orderModel.create(ordersData, options);
};

export const getOrdersByUser = async (userId) => {
    return await orderModel.find({ user: userId })
        .sort({ createdAt: -1 })
        .populate({
            path: 'items.product',
            select: 'title images price description'
        })
        .lean();
};

