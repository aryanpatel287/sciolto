import mongoose from 'mongoose';
import {
    findProductById,
    findProductByIdLean,
    createProduct,
    updateProductById,
    findProductsBySeller,
    countProducts,
    findProductsPaginated
} from '../dao/product.dao.js';
import { findCategoryBySlugOrName } from '../dao/category.dao.js';
import { sendResponse } from '../utils/response.utlis.js';
import { uploadFileToImageKit } from '../services/storage.service.js';

const parseVariants = (variants) => {
    if (!variants) {
        return [];
    }

    if (typeof variants === 'string') {
        try {
            return JSON.parse(variants);
        } catch (error) {
            throw new Error('Variants must be valid JSON');
        }
    }

    return variants;
};

/**
 * @route POST /api/products/:productId/variants
 * @description Create a new variant for a product
 * @access Private (sellers only)
 * @param {Object} variantData - The data for the new variant
 * @returns {Object} - The created variant object
 * @throws {Error} - Throws an error if the variant creation fails
 * @body { title, description, price: { amount, currency }, stock, images: [{ url, alt }] }
 */
async function createVariant(variantData) {
    try {
        const { attributes, stock, price, images = [] } = variantData;

        const processedImages = await Promise.all(
            images.map(async (image) => {
                if (image.buffer) {
                    let bufferObj = image.buffer;
                    if (typeof bufferObj === 'string') {
                        const base64Data = bufferObj.replace(
                            /^data:image\/\w+;base64,/,
                            '',
                        );
                        bufferObj = Buffer.from(base64Data, 'base64');
                    } else if (
                        bufferObj &&
                        bufferObj.type === 'Buffer' &&
                        Array.isArray(bufferObj.data)
                    ) {
                        bufferObj = Buffer.from(bufferObj.data);
                    }

                    const uploadResult = await uploadFileToImageKit({
                        buffer: bufferObj,
                        fileName: image.originalname || 'variant-image',
                        folder: 'variants',
                    });
                    return {
                        url: uploadResult.url,
                        thumbnailUrl: uploadResult.thumbnailUrl,
                        alt: image.alt || 'Variant Image',
                    };
                }
                return {
                    url: image.url,
                    thumbnailUrl: image.thumbnailUrl,
                    alt: image.alt || 'Variant Image',
                };
            }),
        );

        const variant = {
            attributes: attributes || {},
            stock: Number(stock),
            price: {
                amount: Number(price?.amount),
                currency: price?.currency || 'INR',
            },
            images: processedImages,
        };

        return variant;
    } catch (error) {
        throw new Error('Failed to create variant: ' + error.message);
    }
}

/**
 * @route POST /api/products/seller/create-product
 * @description Create a new product
 * @access Private (sellers only)
 * @body { title, description, priceAmount, priceCurrency, images, variants }
 */
async function createProductController(req, res) {
    try {
        const { title, description, priceAmount, priceCurrency, variants } =
            req.body;
        const files = req.files || [];

        const seller = req.user._id;
        const parsedVariants = parseVariants(variants);

        const images = await Promise.all(
            files.map(async (file) => {
                const uploadResult = await uploadFileToImageKit({
                    buffer: file.buffer,
                    fileName: file.originalname,
                    folder: `products/${seller}`,
                });

                return {
                    url: uploadResult.url,
                    thumbnailUrl: uploadResult.thumbnailUrl,
                    alt: title,
                };
            }),
        );

        if (!images || images.length === 0) {
            throw new Error('At least one image is required');
        }

        const variantObjects = await Promise.all(
            parsedVariants.map((variant) => createVariant(variant)),
        );

        const product = await createProduct({
            title,
            description,
            price: {
                amount: priceAmount,
                currency: priceCurrency || 'INR',
            },
            images,
            seller,
            variants: variantObjects,
        });

        return sendResponse({
            res,
            statusCode: 201,
            message: 'Product created successfully',
            success: true,
            product,
        });
    } catch (error) {
        console.error('Error creating product', error);

        if (error.message === 'Variants must be valid JSON') {
            return sendResponse({
                res,
                statusCode: 400,
                message: error.message,
                success: false,
                error: error.message,
            });
        }

        return sendResponse({
            res,
            statusCode: 500,
            message: 'Failed to create product',
            success: false,
            error: 'Failed to create product',
        });
    }
}

/**
 * @route PUT /api/products/seller/:productId
 * @description Update a product
 * @access Private (sellers only)
 * @param {string} productId - The ID of the product to update
 * @returns {Object} - The updated product object
 * @throws {Error} - Throws an error if the product update fails
 * @body { title, description, price: { amount, currency }, images, variants }
 */
async function updateProductController(req, res) {
    const productId = req.params.productId;

    if (!productId) {
        return sendResponse({
            res,
            statusCode: 400,
            message: 'Product ID is required',
            success: false,
            error: 'Product ID is required',
        });
    }

    try {
        const updateData = req.body;
        const updatedProduct = await updateProductById(productId, updateData);

        if (!updatedProduct) {
            return sendResponse({
                res,
                statusCode: 404,
                message: 'Product not found',
                success: false,
                error: 'Product not found',
            });
        }

        return sendResponse({
            res,
            statusCode: 200,
            message: 'Product updated successfully',
            success: true,
            product: updatedProduct,
        });
    } catch (error) {
        console.error('Error updating product', error);

        return sendResponse({
            res,
            statusCode: 500,
            message: 'Failed to update product',
            success: false,
            error: 'Failed to update product',
        });
    }
}

/**
 * @route GET /api/products/seller/get-products
 * @description Get all products of a seller
 * @access Private (sellers only)
 * @body No body required
 */
async function getSellerProductsController(req, res) {
    const seller = req.user._id;

    try {
        const products = await findProductsBySeller(seller);

        return sendResponse({
            res,
            statusCode: 200,
            message: 'Products fetched successfully',
            success: true,
            products,
        });
    } catch (error) {
        console.error('Error fetching products', error);

        return sendResponse({
            res,
            statusCode: 500,
            message: 'Failed to fetch products',
            success: false,
            error: 'Failed to fetch products',
        });
    }
}

async function getProductsController(req, res) {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 9;
        const skip = (page - 1) * limit;

        const { search, category, priceRange, color, size, sortBy } = req.query;

        const filter = { isActive: { $ne: false } };

        if (search) {
            filter.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
            ];
        }

        if (category) {
            if (mongoose.Types.ObjectId.isValid(category)) {
                filter.category = category;
            } else {
                const catDoc = await findCategoryBySlugOrName(category);
                if (catDoc) {
                    filter.category = catDoc._id;
                } else {
                    filter.category = new mongoose.Types.ObjectId();
                }
            }
        }

        if (priceRange) {
            filter['price.amount'] = { $lte: Number(priceRange) };
        }

        if (color) {
            const colorRegex = new RegExp(`^${color}$`, 'i');
            filter.$and = filter.$and || [];
            filter.$and.push({
                $or: [
                    { 'variants.attributes.color': colorRegex },
                    { title: { $regex: color, $options: 'i' } },
                ],
            });
        }

        if (size) {
            const sizeRegex = new RegExp(`^${size}$`, 'i');
            filter.$and = filter.$and || [];
            filter.$and.push({
                $or: [
                    { 'variants.attributes.size': sizeRegex },
                    { description: { $regex: size, $options: 'i' } },
                ],
            });
        }

        let sort = { createdAt: -1 };
        if (sortBy === 'price_asc') {
            sort = { 'price.amount': 1 };
        } else if (sortBy === 'price_desc') {
            sort = { 'price.amount': -1 };
        }

        const products = await findProductsPaginated({ filter, sort, skip, limit });

        const totalProducts = await countProducts(filter);

        return sendResponse({
            res,
            statusCode: 200,
            message: 'Products fetched successfully',
            success: true,
            products,
            totalPages: Math.ceil(totalProducts / limit) || 1,
            totalProducts,
            currentPage: page,
        });
    } catch (error) {
        console.error('Error fetching products', error);

        return sendResponse({
            res,
            statusCode: 500,
            message: 'Failed to fetch products',
            success: false,
            error: error.message,
        });
    }
}

async function getAProductController(req, res) {
    const productId = req.params.productId;

    if (!productId) {
        return sendResponse({
            res,
            statusCode: 400,
            message: 'Product ID is required',
            success: false,
            error: 'Product ID is required',
        });
    }

    try {
        const product = await findProductByIdLean(productId);

        if (!product) {
            return sendResponse({
                res,
                statusCode: 404,
                message: 'Product not found',
                success: false,
                error: 'Product not found',
            });
        }
        return sendResponse({
            res,
            statusCode: 200,
            message: 'Product fetched successfully',
            success: true,
            product,
        });
    } catch (error) {
        console.error('Error fetching product', error);

        return sendResponse({
            res,
            statusCode: 500,
            message: 'Failed to fetch product',
            success: false,
            error: 'Failed to fetch product',
        });
    }
}

async function createVariantController(req, res) {
    const productId = req.params.productId;

    if (!productId) {
        return sendResponse({
            res,
            statusCode: 400,
            message: 'Product ID is required',
            success: false,
            error: 'Product ID is required',
        });
    }

    try {
        const variantData = req.body;
        const variant = await createVariant(variantData);

        const product = await findProductById(productId);
        if (!product) {
            return sendResponse({
                res,
                statusCode: 404,
                message: 'Product not found',
                success: false,
                error: 'Product not found',
            });
        }

        product.variants.push(variant);
        await product.save();

        return sendResponse({
            res,
            statusCode: 201,
            message: 'Variant created successfully',
            success: true,
            product,
        });
    } catch (error) {
        console.error('Error creating variant', error);

        return sendResponse({
            res,
            statusCode: 500,
            message: 'Failed to create variant',
            success: false,
            error: 'Failed to create variant',
        });
    }
}

async function getProductsByCategoryController(req, res) {
    try {
        const categoryId = req.params.categoryId;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 4;
        const skip = (page - 1) * limit;
        const exclude = req.query.exclude;

        if (!categoryId) {
            return sendResponse({
                res,
                statusCode: 400,
                message: 'Category ID is required',
                success: false,
                error: 'Category ID is required',
            });
        }

        const filter = { category: categoryId, isActive: { $ne: false } };
        if (exclude && mongoose.Types.ObjectId.isValid(exclude)) {
            filter._id = { $ne: exclude };
        }

        const productsByCategory = await findProductsPaginated({
            filter,
            sort: { createdAt: -1 },
            skip,
            limit,
        });

        const totalProducts = await countProducts(filter);

        return sendResponse({
            res,
            success: true,
            statusCode: 200,
            message: 'Products by category fetched successfully',
            productsByCategory,
            totalPages: Math.ceil(totalProducts / limit) || 1,
            totalProducts,
            currentPage: page,
        });
    } catch (error) {
        console.error('Error fetching products by category:', error);
        sendResponse({
            res,
            success: false,
            statusCode: 500,
            message: 'Internal Server Error',
            error: error.message,
        });
    }
}

export {
    createProductController,
    getProductsController,
    getSellerProductsController,
    getAProductController,
    createVariantController,
    updateProductController,
    getProductsByCategoryController,
};
