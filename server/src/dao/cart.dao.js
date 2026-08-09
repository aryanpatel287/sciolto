import cartModel from '../models/cart.model.js';
import mongoose from 'mongoose';

/**
 * Finds or creates a cart document for a user.
 * @param {string|mongoose.Types.ObjectId} userId - The user's ID
 * @returns {Promise<Object>} The Mongoose cart document
 */
export const findOrCreateCart = async (userId) => {
    let cart = await cartModel.findOne({ user: userId });
    if (!cart) {
        cart = await cartModel.create({ user: userId, items: [] });
    }
    return cart;
};

/**
 * Encapsulates the aggregation pipeline to retrieve a formatted cart with computed prices.
 * Returns a standard empty cart object if the cart has no items.
 * @param {string|mongoose.Types.ObjectId} userId - The user's ID
 * @returns {Promise<Object>} The aggregated and formatted cart object
 */
export const getFormattedCart = async (userId, session) => {
    const cartDoc = await findOrCreateCart(userId);

    if (!cartDoc.items || cartDoc.items.length === 0) {
        return {
            _id: cartDoc._id,
            items: [],
            totalCartPrice: {
                amount: 0,
                currency: 'INR',
            },
        };
    }

    const options = session ? { session } : {};

    const [aggregatedCart] = await cartModel.aggregate([
        {
            $match: {
                user: new mongoose.Types.ObjectId(userId),
            },
        },
        {
            $unwind: {
                path: '$items',
            },
        },
        {
            $lookup: {
                from: 'products',
                let: { prodId: '$items.product', varId: '$items.variant' },
                pipeline: [
                    { $match: { $expr: { $eq: ['$_id', '$$prodId'] } } },
                    {
                        $project: {
                            title: 1,
                            seller: 1,
                            price: 1,
                            variants: {
                                $filter: {
                                    input: '$variants',
                                    as: 'v',
                                    cond: { $eq: ['$$v._id', '$$varId'] },
                                },
                            },
                        },
                    },
                ],
                as: 'items.product',
            },
        },
        {
            $unwind: {
                path: '$items.product',
            },
        },
        {
            $unwind: {
                path: '$items.product.variants',
            },
        },
        {
            $set: {
                'items.product.variants.isInStock': {
                    $gte: [
                        {
                            $subtract: [
                                {
                                    $ifNull: [
                                        '$items.product.variants.stock',
                                        0,
                                    ],
                                },
                                { $ifNull: ['$items.quantity', 0] },
                            ],
                        },
                        0,
                    ],
                },
            },
        },
        {
            $set: {
                'items.itemSubTotal': {
                    amount: {
                        $multiply: [
                            '$items.quantity',
                            { $ifNull: ['$items.product.variants.price.amount', '$items.product.price.amount'] },
                        ],
                    },
                    currency: { $ifNull: ['$items.product.variants.price.currency', '$items.product.price.currency'] },
                },
            },
        },
        {
            $group: {
                _id: '$_id',
                items: {
                    $push: '$items',
                },
                totalAmount: {
                    $sum: '$items.itemSubTotal.amount',
                },
                currency: {
                    $first: '$items.itemSubTotal.currency',
                },
            },
        },
        {
            $project: {
                items: 1,
                totalCartPrice: {
                    amount: '$totalAmount',
                    currency: '$currency',
                },
            },
        },
    ], options);

    return (
        aggregatedCart || {
            _id: cartDoc._id,
            items: [],
            totalCartPrice: {
                amount: 0,
                currency: 'INR',
            },
        }
    );
};

export const clearCart = async (userId, session) => {
    const options = session ? { session, new: true } : { new: true };
    return await cartModel.findOneAndUpdate(
        { user: userId },
        { $set: { items: [] } },
        options
    );
};

