import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
    createUser,
    findUserByEmail,
    findUserByEmailOrContact,
    findUserByEmailWithPassword,
    updateUserPassword,
    getCachedUser,
    invalidateUserCache,
} from '../dao/user.dao.js';
import userModel from '../models/user.model.js';
import redis from '../config/cache.js';

// Mock Redis client
vi.mock('../config/cache.js', () => ({
    default: {
        get: vi.fn(),
        set: vi.fn(),
        del: vi.fn(),
    },
}));

// Mock Mongoose User Model
vi.mock('../models/user.model.js', () => ({
    default: {
        findOne: vi.fn(),
        create: vi.fn(),
        findById: vi.fn(),
        findByIdAndUpdate: vi.fn(),
    },
}));

describe('User DAO tests', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should create a user', async () => {
        const payload = { email: 'test@example.com', password: 'password123' };
        userModel.create.mockResolvedValue(payload);

        const user = await createUser(payload);
        expect(user).toBeDefined();
        expect(user.email).toBe('test@example.com');
        expect(userModel.create).toHaveBeenCalledWith(payload);
    });

    it('should find user by email or contact', async () => {
        const userMock = { email: 'test@example.com' };
        userModel.findOne.mockResolvedValue(userMock);

        const user = await findUserByEmailOrContact('test@example.com', '123456');
        expect(user).toBe(userMock);
        expect(userModel.findOne).toHaveBeenCalledWith({
            $or: [{ email: 'test@example.com' }, { contact: '123456' }],
        });
    });

    it('should find user by email with password select', async () => {
        const chain = { select: vi.fn().mockResolvedValue({ password: 'hash' }) };
        userModel.findOne.mockReturnValue(chain);

        const user = await findUserByEmailWithPassword('test@example.com');
        expect(user.password).toBe('hash');
        expect(userModel.findOne).toHaveBeenCalledWith({ email: 'test@example.com' });
        expect(chain.select).toHaveBeenCalledWith('+password');
    });

    it('should find user by email', async () => {
        const userMock = { email: 'test@example.com' };
        userModel.findOne.mockResolvedValue(userMock);

        const user = await findUserByEmail('test@example.com');
        expect(user).toBe(userMock);
        expect(userModel.findOne).toHaveBeenCalledWith({ email: 'test@example.com' });
    });

    it('should update user password', async () => {
        const chain = { select: vi.fn().mockResolvedValue({ password: 'newHash' }) };
        userModel.findByIdAndUpdate.mockReturnValue(chain);

        const updated = await updateUserPassword('userId123', 'newHash');
        expect(updated.password).toBe('newHash');
        expect(userModel.findByIdAndUpdate).toHaveBeenCalledWith(
            'userId123',
            { password: 'newHash' },
            { new: true }
        );
        expect(chain.select).toHaveBeenCalledWith('+password');
    });

    it('should get cached user from Redis if available', async () => {
        redis.get.mockResolvedValue(JSON.stringify({ _id: '123', email: 'test@cached.com' }));
        const user = await getCachedUser('123');
        expect(user.email).toBe('test@cached.com');
        expect(redis.get).toHaveBeenCalledWith('sciolto:user:123');
        expect(userModel.findById).not.toHaveBeenCalled();
    });

    it('should fetch user from DB and cache it if Redis is empty', async () => {
        redis.get.mockResolvedValue(null);
        const queryChain = { lean: vi.fn().mockResolvedValue({ _id: '123', email: 'db@test.com' }) };
        userModel.findById.mockReturnValue(queryChain);

        const user = await getCachedUser('123');
        expect(user.email).toBe('db@test.com');
        expect(redis.get).toHaveBeenCalledWith('sciolto:user:123');
        expect(userModel.findById).toHaveBeenCalledWith('123');
        expect(queryChain.lean).toHaveBeenCalled();
        expect(redis.set).toHaveBeenCalledWith(
            'sciolto:user:123',
            JSON.stringify({ _id: '123', email: 'db@test.com' }),
            'EX',
            600
        );
    });

    it('should invalidate user cache', async () => {
        await invalidateUserCache('123');
        expect(redis.del).toHaveBeenCalledWith('sciolto:user:123');
    });
});
