import orderModel from '../models/order.model.js';

export const createOrders = async (ordersData, session) => {
    const options = session ? { session } : {};
    return await orderModel.create(ordersData, options);
};
