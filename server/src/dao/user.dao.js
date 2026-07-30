import userModel from '../models/user.model.js';
import redis from '../config/cache.js';

export async function findUserByEmailOrContact(email, contact) {
    return await userModel.findOne({
        $or: [{ email }, { contact }],
    });
}

export async function createUser(userData) {
    return await userModel.create(userData);
}

export async function findUserByEmailWithPassword(email) {
    return await userModel.findOne({ email }).select('+password');
}

export async function findUserByEmail(email) {
    return await userModel.findOne({ email });
}

export async function updateUserPassword(userId, hashedPassword) {
    return await userModel.findByIdAndUpdate(
        userId,
        { password: hashedPassword },
        { new: true }
    ).select('+password');
}

export async function getCachedUser(userId) {
    const cacheKey = `sciolto:user:${userId}`;
    const cached = await redis.get(cacheKey);

    if (cached) {
        return JSON.parse(cached);
    }

    const user = await userModel.findById(userId).lean();
    if (!user) return null;

    await redis.set(cacheKey, JSON.stringify(user), 'EX', 60 * 10);
    return user;
}

export async function invalidateUserCache(userId) {
    await redis.del(`sciolto:user:${userId}`);
}
