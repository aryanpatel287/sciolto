import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import app from '../app.js';
import cartModel from '../models/cart.model.js';
import productModel from '../models/product.model.js';
import redis from '../config/cache.js';
import { findStockOfProduct, findProductByIdLean } from '../dao/product.dao.js';

// Mock Redis client
vi.mock('../config/cache.js', () => ({
    default: {
        get: vi.fn(),
        set: vi.fn(),
    },
}));

// Mock Product Model
vi.mock('../models/product.model.js', () => ({
    default: {
        findById: vi.fn(),
    },
}));

// Mock Product DAO
vi.mock('../dao/product.dao.js', () => ({
    findStockOfProduct: vi.fn(),
    findProductByIdLean: vi.fn(),
}));

// Mock Cart Model
vi.mock('../models/cart.model.js', () => ({
    default: {
        findOne: vi.fn(),
        create: vi.fn(),
        aggregate: vi.fn(),
    },
}));

describe('Cart Endpoints & DAO', () => {
    // Using valid 24-character hex strings for MongoDB ObjectIds
    const userId = '60d5ec49f8c42ad99d61396d';
    const productId = '60d5ec49f8c42ad99d61396e';
    const variantId = '60d5ec49f8c42ad99d61396f';
    const cartId = '60d5ec49f8c42ad99d61396a';

    let token;

    beforeEach(() => {
        vi.clearAllMocks();
        redis.get.mockResolvedValue(null);

        // Generate authenticated buyer token
        token = jwt.sign(
            { _id: userId, role: 'buyer' },
            process.env.JWT_SECRET || 'testsecret'
        );
    });

    describe('GET /api/cart', () => {
        it('should return empty cart format when cart has no items', async () => {
            const mockCartDoc = {
                _id: cartId,
                user: userId,
                items: [],
            };
            cartModel.findOne.mockResolvedValue(mockCartDoc);

            const response = await request(app)
                .get('/api/cart')
                .set('Cookie', [`token=${token}`]);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.cart.items).toEqual([]);
            expect(response.body.cart.totalCartPrice).toEqual({
                amount: 0,
                currency: 'INR',
            });
        });

        it('should return aggregated cart when cart has items', async () => {
            const mockCartDoc = {
                _id: cartId,
                user: userId,
                items: [{ product: productId, variant: variantId, quantity: 2, price: { amount: 500, currency: 'INR' } }],
            };
            cartModel.findOne.mockResolvedValue(mockCartDoc);

            const mockAggregatedCart = {
                _id: cartId,
                items: [
                    {
                        product: {
                            _id: productId,
                            title: 'Sciolto Tee',
                            variants: { _id: variantId, price: { amount: 500, currency: 'INR' } },
                        },
                        variant: variantId,
                        quantity: 2,
                    },
                ],
                totalCartPrice: {
                    amount: 1000,
                    currency: 'INR',
                },
            };
            cartModel.aggregate.mockResolvedValue([mockAggregatedCart]);

            const response = await request(app)
                .get('/api/cart')
                .set('Cookie', [`token=${token}`]);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.cart.totalCartPrice.amount).toBe(1000);
            expect(response.body.cart.items.length).toBe(1);
        });
    });

    describe('POST /api/cart/add/:productId', () => {
        it('should add product to cart and return formatted cart', async () => {
            const mockProduct = {
                _id: productId,
                price: { amount: 599, currency: 'INR' },
                variants: [],
            };
            const mockCart = {
                _id: cartId,
                user: userId,
                items: [],
                save: vi.fn().mockResolvedValue(true),
            };

            findProductByIdLean.mockResolvedValue(mockProduct);
            cartModel.findOne.mockResolvedValue(mockCart);
            findStockOfProduct.mockResolvedValue(10);

            // Mock aggregation result for new cart state
            const mockAggregatedCart = {
                _id: cartId,
                items: [
                    {
                        product: {
                            _id: productId,
                            title: 'Sciolto Tee',
                            variants: { price: { amount: 599, currency: 'INR' } },
                        },
                        quantity: 1,
                    },
                ],
                totalCartPrice: {
                    amount: 599,
                    currency: 'INR',
                },
            };
            cartModel.aggregate.mockResolvedValue([mockAggregatedCart]);

            const response = await request(app)
                .post(`/api/cart/add/${productId}`)
                .set('Cookie', [`token=${token}`])
                .send({ quantity: 1 });

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.cart.totalCartPrice.amount).toBe(599);
            expect(mockCart.save).toHaveBeenCalled();
        });
    });

    describe('GET /api/cart/count', () => {
        it('should return count 0 if user has no cart', async () => {
            cartModel.findOne.mockResolvedValue(null);

            const response = await request(app)
                .get('/api/cart/count')
                .set('Cookie', [`token=${token}`]);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.count).toBe(0);
        });

        it('should sum up quantities of items in the cart', async () => {
            cartModel.findOne.mockResolvedValue({
                items: [
                    { quantity: 2 },
                    { quantity: 3 }
                ]
            });

            const response = await request(app)
                .get('/api/cart/count')
                .set('Cookie', [`token=${token}`]);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.count).toBe(5);
        });
    });
});
