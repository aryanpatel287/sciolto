import orderModel from '../models/order.model.js';
import { sendResponse } from '../utils/response.utlis.js';

async function createOrderController(req, res) {
    try {
        const { items, addressId, paymentId } = req.body;

        console.log(items, addressId, paymentId);

        const order = await orderModel.create({
            user: req.user._id,
            items,
            address: addressId,
            payment: paymentId,
        });

        return sendResponse({
            res,
            statusCode: 201,
            message: 'Order created successfully',
            success: true,
            order,
        });
    } catch (error) {
        return sendResponse({
            res,
            statusCode: 500,
            message: 'Failed to create order',
            success: false,
            error: error.message,
        });
    }
}

export { createOrderController };
