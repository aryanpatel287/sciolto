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
export const getFormattedCart = async (userId) => {
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
                localField: 'items.product',
                foreignField: '_id',
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
            $match: {
                $expr: {
                    $eq: ['$items.product.variants._id', '$items.variant'],
                },
            },
        },
        {
            $addFields: {
                itemPrice: {
                    amount: {
                        $multiply: [
                            '$items.quantity',
                            '$items.product.variants.price.amount',
                        ],
                    },
                    currency: '$items.product.variants.price.currency',
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
                    $sum: '$itemPrice.amount',
                },
                currency: {
                    $first: '$itemPrice.currency',
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
    ]);

    return aggregatedCart || {
        _id: cartDoc._id,
        items: [],
        totalCartPrice: {
            amount: 0,
            currency: 'INR',
        },
    };
};
