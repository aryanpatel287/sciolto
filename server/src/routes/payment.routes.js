import { Router } from 'express';
import {
    createPaymentOrderController,
    verifyPaymentOrderController,
} from '../controllers/payment.controller.js';
import { authUser } from '../middlewares/auth.middleware.js';

const paymentRouter = Router();

/**
 * @route POST /api/payments/create/order
 * @desc Create an order for payment
 * @access Private
 * @body { amount, currency }
 */
paymentRouter.post('/create/order', authUser, createPaymentOrderController);

/**
 * @route POST /api/payments/verify/order
 * @desc Verify an order for payment
 * @access Private
 * @body { orderId, paymentId, signature }
 */
paymentRouter.post('/verify/order', authUser, verifyPaymentOrderController);

export default paymentRouter;
