import { Router } from 'express';
import { authUser } from '../middlewares/auth.middleware.js';
import { createOrderController, getUserOrdersController } from '../controllers/order.controller.js';

const orderRouter = Router();

/**
 * @route POST /api/orders/create
 * @desc Create an order
 * @access Private
 * @body { items, addressId }
 */
orderRouter.post('/create', authUser, createOrderController);

/**
 * @route GET /api/orders
 * @desc Retrieve user orders
 * @access Private
 */
orderRouter.get('/', authUser, getUserOrdersController);

export default orderRouter;
