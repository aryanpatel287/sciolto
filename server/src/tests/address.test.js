import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../app.js';
import addressModel from '../models/address.model.js';
import redis from '../config/cache.js';
import jwt from 'jsonwebtoken';

vi.mock('../models/address.model.js', () => ({
    default: {
        create: vi.fn(),
        find: vi.fn(),
        findOne: vi.fn(),
        findOneAndUpdate: vi.fn(),
        findOneAndDelete: vi.fn(),
    },
}));

vi.mock('../config/cache.js', () => ({
    default: {
        get: vi.fn(),
        set: vi.fn(),
        del: vi.fn(),
    },
}));

describe('Address API Routes', () => {
    let token;

    beforeEach(() => {
        vi.clearAllMocks();
        process.env.JWT_SECRET = 'test_secret';
        token = jwt.sign({ _id: 'u1', role: 'user' }, process.env.JWT_SECRET);
        redis.get.mockResolvedValue(null);
    });

    it('should return 400 for request without auth token', async () => {
        const res = await request(app).get('/api/address');
        expect(res.status).toBe(400);
    });

    it('should create an address with valid inputs', async () => {
        addressModel.create.mockResolvedValue({
            _id: 'a123',
            name: 'Recipient Name',
            contact: '9876543210',
            addressLine1: 'H No 12',
            city: 'Delhi',
            state: 'Delhi',
            pincode: '110001',
            user: 'u1',
        });

        const res = await request(app)
            .post('/api/address')
            .set('Cookie', [`token=${token}`])
            .send({
                name: 'Recipient Name',
                contact: '9876543210',
                addressLine1: 'H No 12',
                city: 'Delhi',
                state: 'Delhi',
                pincode: '110001',
            });

        expect(res.status).toBe(201);
        expect(res.body.success).toBe(true);
        expect(res.body.address._id).toBe('a123');
    });

    it('should return 400 validation error for invalid pincode', async () => {
        const res = await request(app)
            .post('/api/address')
            .set('Cookie', [`token=${token}`])
            .send({
                name: 'Recipient Name',
                contact: '9876543210',
                addressLine1: 'H No 12',
                city: 'Delhi',
                state: 'Delhi',
                pincode: '1100',
            });

        expect(res.status).toBe(400);
        expect(res.body.errors).toBeDefined();
    });
});
