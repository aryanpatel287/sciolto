import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import app from '../app.js';
import paymentModel from '../models/payment.model.js';
import { createOrderOnRazorpay } from '../services/payment.service.js';
import mongoose from 'mongoose';
import * as paymentDao from '../dao/payment.dao.js';
import * as cartDao from '../dao/cart.dao.js';
import * as productDao from '../dao/product.dao.js';
import * as orderDao from '../dao/order.dao.js';
import redis from '../config/cache.js';
import { validatePaymentVerification } from 'razorpay/dist/utils/razorpay-utils.js';


// Mock Redis client
vi.mock('../config/cache.js', () => ({
    default: {
        get: vi.fn(),
        set: vi.fn(),
    },
}));

// Mock Mongoose Payment Model
vi.mock('../models/payment.model.js', () => ({
    default: {
        create: vi.fn(),
    },
}));

// Mock payment service
vi.mock('../services/payment.service.js', () => ({
    createOrderOnRazorpay: vi.fn(),
}));

// Mock DAOs
vi.mock('../dao/payment.dao.js', () => ({
    findPaymentByOrderId: vi.fn(),
    updatePaymentStatus: vi.fn(),
    createPaymentRecord: vi.fn(),
}));

vi.mock('../dao/cart.dao.js', () => ({
    getFormattedCart: vi.fn(),
    clearCart: vi.fn(),
}));

vi.mock('../dao/product.dao.js', () => ({
    decrementProductVariantStock: vi.fn(),
}));

vi.mock('../dao/order.dao.js', () => ({
    createOrders: vi.fn(),
}));

// Mock Razorpay signature validation utility
vi.mock('razorpay/dist/utils/razorpay-utils.js', () => ({
    validatePaymentVerification: vi.fn().mockReturnValue(true),
}));


describe('Payment Endpoints', () => {
    const userId = '60d5ec49f8c42ad99d61396d';
    let token;

    beforeEach(() => {
        vi.resetAllMocks();
        redis.get.mockResolvedValue(null);
        validatePaymentVerification.mockReturnValue(true);
        token = jwt.sign(
            { _id: userId, role: 'buyer' },
            process.env.JWT_SECRET || 'testsecret'
        );
    });


    describe('POST /api/payments/create/order', () => {
        it('should create payment order successfully', async () => {
            const mockRazorpayOrder = {
                id: 'order_mock123',
                amount: 100000,
                currency: 'INR',
            };

            const mockPaymentRecord = {
                _id: 'payment_mock123',
                status: 'pending',
                user: userId,
                razorpay: {
                    orderId: 'order_mock123',
                },
                price: {
                    amount: 100000,
                    currency: 'INR',
                },
            };

            createOrderOnRazorpay.mockResolvedValue(mockRazorpayOrder);
            paymentDao.createPaymentRecord.mockResolvedValue(mockPaymentRecord);

            const response = await request(app)
                .post('/api/payments/create/order')
                .set('Cookie', [`token=${token}`])
                .send({ amount: 1000, currency: 'INR' });

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.message).toBe('Order created successfully');
            expect(response.body.razorpayOrder).toEqual(mockRazorpayOrder);
            expect(createOrderOnRazorpay).toHaveBeenCalledWith({ amount: 1000, currency: 'INR' });
            expect(paymentDao.createPaymentRecord).toHaveBeenCalled();
        });
    });

    describe('POST /api/payments/verify/order', () => {
        let mockSession;

        beforeEach(() => {
            mockSession = {
                startTransaction: vi.fn(),
                commitTransaction: vi.fn(),
                abortTransaction: vi.fn(),
                endSession: vi.fn(),
            };
            vi.spyOn(mongoose, 'startSession').mockResolvedValue(mockSession);
        });

        it('should verify payment, decrement stock, split orders by seller, and clear cart successfully', async () => {
            const razorpay_order_id = 'order_rzp123';
            const razorpay_payment_id = 'pay_rzp123';
            const razorpay_signature = 'sig123';

            // Mock DAO responses
            const mockPayment = {
                _id: 'payment_record_123',
                user: userId,
                status: 'pending',
                razorpay: {},
                price: { amount: 1200, currency: 'INR' },
                save: vi.fn().mockResolvedValue(true),
            };
            paymentDao.findPaymentByOrderId.mockResolvedValue(mockPayment);

            const mockCart = {
                _id: 'cart_id_123',
                items: [
                    {
                        product: {
                            _id: 'prodA',
                            title: 'Product A',
                            seller: 'seller1',
                            price: { amount: 500, currency: 'INR' },
                            variants: { _id: 'varA', price: { amount: 500, currency: 'INR' } },
                        },
                        variant: 'varA',
                        quantity: 2,
                        itemSubTotal: { amount: 1000, currency: 'INR' },
                    },
                    {
                        product: {
                            _id: 'prodB',
                            title: 'Product B',
                            seller: 'seller2',
                            price: { amount: 200, currency: 'INR' },
                            variants: { _id: 'varB', price: { amount: 200, currency: 'INR' } },
                        },
                        variant: 'varB',
                        quantity: 1,
                        itemSubTotal: { amount: 200, currency: 'INR' },
                    },
                ],
            };
            cartDao.getFormattedCart.mockResolvedValue(mockCart);

            // Atomic decrements project and return specific fields
            productDao.decrementProductVariantStock
                .mockResolvedValueOnce({ _id: 'prodA' })
                .mockResolvedValueOnce({ _id: 'prodB' });

            orderDao.createOrders.mockResolvedValue([{}]);
            cartDao.clearCart.mockResolvedValue(true);

            const response = await request(app)
                .post('/api/payments/verify/order')
                .set('Cookie', [`token=${token}`])
                .send({ razorpay_order_id, razorpay_payment_id, razorpay_signature });

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(mockSession.startTransaction).toHaveBeenCalled();
            expect(productDao.decrementProductVariantStock).toHaveBeenCalledTimes(2);
            expect(orderDao.createOrders).toHaveBeenCalled();
            expect(cartDao.clearCart).toHaveBeenCalled();
            expect(mockSession.commitTransaction).toHaveBeenCalled();
            expect(mockSession.endSession).toHaveBeenCalled();
        });

        it('should rollback transaction and mark payment failed on insufficient stock', async () => {
            const razorpay_order_id = 'order_rzp123';
            const razorpay_payment_id = 'pay_rzp123';
            const razorpay_signature = 'sig123';

            const mockPayment = {
                _id: 'payment_record_123',
                user: userId,
                status: 'pending',
                razorpay: {},
                price: { amount: 1200, currency: 'INR' },
                save: vi.fn().mockResolvedValue(true),
            };
            paymentDao.findPaymentByOrderId.mockResolvedValue(mockPayment);

            const mockCart = {
                _id: 'cart_id_123',
                items: [
                    {
                        product: {
                            _id: 'prodA',
                            title: 'Product A',
                            seller: 'seller1',
                            price: { amount: 500, currency: 'INR' },
                            variants: { _id: 'varA', price: { amount: 500, currency: 'INR' } },
                        },
                        variant: 'varA',
                        quantity: 2,
                        itemSubTotal: { amount: 1000, currency: 'INR' },
                    }
                ]
            };
            cartDao.getFormattedCart.mockResolvedValue(mockCart);

            // Atomic decrement fails (returns null)
            productDao.decrementProductVariantStock.mockResolvedValue(null);
            paymentDao.updatePaymentStatus.mockResolvedValue(true);

            const response = await request(app)
                .post('/api/payments/verify/order')
                .set('Cookie', [`token=${token}`])
                .send({ razorpay_order_id, razorpay_payment_id, razorpay_signature });

            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
            expect(mockSession.abortTransaction).toHaveBeenCalled();
            expect(paymentDao.updatePaymentStatus).toHaveBeenCalled();
            expect(mockSession.endSession).toHaveBeenCalled();
        });
    });
});

