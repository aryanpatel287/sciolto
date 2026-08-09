import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../app.js';
import orderModel from '../models/order.model.js';
import redis from '../config/cache.js';
import jwt from 'jsonwebtoken';

vi.mock('../models/order.model.js', () => ({
    default: {
        find: vi.fn(() => ({
            sort: vi.fn(() => ({
                populate: vi.fn(() => ({
                    lean: vi.fn(() => [])
                }))
            }))
        }))
    }
}));

vi.mock('../config/cache.js', () => ({
    default: {
        get: vi.fn(),
        set: vi.fn(),
        del: vi.fn()
    }
}));

describe('Order Retrieval API', () => {
    let tokenUserA, tokenUserB;
    beforeEach(() => {
        vi.clearAllMocks();
        process.env.JWT_SECRET = 'test_secret';
        tokenUserA = jwt.sign({ _id: 'userA', role: 'buyer' }, process.env.JWT_SECRET);
        tokenUserB = jwt.sign({ _id: 'userB', role: 'buyer' }, process.env.JWT_SECRET);
        redis.get.mockResolvedValue(null);
    });

    it('should fail with 400 when auth token is missing', async () => {
        const res = await request(app).get('/api/orders');
        expect(res.status).toBe(400);
    });

    it('should filter orders by authenticated user', async () => {
        const ordersMock = [
            { _id: 'o1', user: 'userA', totalPrice: { amount: 200, currency: 'INR' }, items: [] }
        ];
        orderModel.find.mockReturnValue({
            sort: vi.fn().mockReturnThis(),
            populate: vi.fn().mockReturnThis(),
            lean: vi.fn().mockResolvedValue(ordersMock)
        });

        const res = await request(app)
            .get('/api/orders')
            .set('Cookie', [`token=${tokenUserA}`]);

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.orders).toHaveLength(1);
        expect(orderModel.find).toHaveBeenCalledWith({ user: 'userA' });
    });
});
