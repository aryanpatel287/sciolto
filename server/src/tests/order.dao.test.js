import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createOrders } from '../dao/order.dao.js';
import orderModel from '../models/order.model.js';

vi.mock('../models/order.model.js', () => ({
    default: {
        create: vi.fn(),
    },
}));

describe('Order DAO', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('createOrders', () => {
        it('should call orderModel.create with ordered: true option when session is provided', async () => {
            const ordersData = [
                { user: 'user-123', seller: 'seller-123', items: [], totalPrice: { amount: 100, currency: 'INR' } }
            ];
            const session = { id: 'session-123' };
            orderModel.create.mockResolvedValue(ordersData);

            const result = await createOrders(ordersData, session);

            expect(orderModel.create).toHaveBeenCalledWith(ordersData, { session, ordered: true });
            expect(result).toBe(ordersData);
        });

        it('should call orderModel.create without session or ordered option when session is undefined', async () => {
            const ordersData = [
                { user: 'user-123', seller: 'seller-123', items: [], totalPrice: { amount: 100, currency: 'INR' } }
            ];
            orderModel.create.mockResolvedValue(ordersData);

            const result = await createOrders(ordersData);

            expect(orderModel.create).toHaveBeenCalledWith(ordersData, {});
            expect(result).toBe(ordersData);
        });
    });
});
