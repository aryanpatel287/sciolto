import productModel from '../models/product.model.js';

export const findStockOfProduct = async (productId, variantId) => {
    try {
        const product = await productModel.findById(productId);

        if (!product) {
            throw new Error('Product not found');
        }

        if (variantId) {
            const variant = product.variants.find(
                (v) => v._id.toString() === variantId,
            );
            if (!variant) {
                throw new Error('Variant not found');
            }
            return variant.stock;
        }

        return product.stock;
    } catch (error) {
        console.error(error);
        return 0;
    }
};

export async function findProductByIdLean(productId) {
    return await productModel.findById(productId).lean();
}

export async function findProductById(productId) {
    return await productModel.findById(productId);
}

export async function createProduct(productData) {
    return await productModel.create(productData);
}

export async function updateProductById(productId, updateData) {
    return await productModel.findByIdAndUpdate(productId, updateData, { new: true });
}

export async function findProductsBySeller(sellerId) {
    return await productModel.find({ seller: sellerId }).populate('seller');
}

export async function countProducts(filter) {
    return await productModel.countDocuments(filter);
}

export async function findProductsPaginated({ filter, sort, skip, limit }) {
    return await productModel
        .find(filter)
        .lean()
        .sort(sort)
        .skip(skip)
        .limit(limit);
}
