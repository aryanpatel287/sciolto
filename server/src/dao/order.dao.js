import orderModel from '../models/order.model.js';

export const createOrders = async (ordersData, session) => {
    const options = session ? { session, ordered: true } : {};
    return await orderModel.create(ordersData, options);
};

