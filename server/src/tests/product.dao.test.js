import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
    findStockOfProduct,
    findProductByIdLean,
    findProductById,
    createProduct,
    updateProductById,
    findProductsBySeller,
    countProducts,
    findProductsPaginated,
} from '../dao/product.dao.js';
import productModel from '../models/product.model.js';

// Mock Mongoose Product Model
vi.mock('../models/product.model.js', () => ({
    default: {
        findById: vi.fn(),
        create: vi.fn(),
        findByIdAndUpdate: vi.fn(),
        find: vi.fn(),
        countDocuments: vi.fn(),
    },
}));

describe('Product DAO Extensions', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should find stock of product (no variant)', async () => {
        productModel.findById.mockResolvedValue({ stock: 15 });
        const stock = await findStockOfProduct('prod-id');
        expect(stock).toBe(15);
        expect(productModel.findById).toHaveBeenCalledWith('prod-id');
    });

    it('should find stock of product variant', async () => {
        productModel.findById.mockResolvedValue({
            variants: [{ _id: { toString: () => 'v-id' }, stock: 8 }]
        });
        const stock = await findStockOfProduct('prod-id', 'v-id');
        expect(stock).toBe(8);
    });

    it('should find product by ID lean', async () => {
        const leanChain = { lean: vi.fn().mockResolvedValue({ _id: 'prod-id' }) };
        productModel.findById.mockReturnValue(leanChain);

        const prod = await findProductByIdLean('prod-id');
        expect(prod._id).toBe('prod-id');
        expect(leanChain.lean).toHaveBeenCalled();
    });

    it('should find product by ID', async () => {
        productModel.findById.mockResolvedValue({ _id: 'prod-id' });
        const prod = await findProductById('prod-id');
        expect(prod._id).toBe('prod-id');
    });

    it('should create product', async () => {
        productModel.create.mockResolvedValue({ title: 'New Product' });
        const prod = await createProduct({ title: 'New Product' });
        expect(prod.title).toBe('New Product');
    });

    it('should update product by ID', async () => {
        productModel.findByIdAndUpdate.mockResolvedValue({ title: 'Updated' });
        const prod = await updateProductById('prod-id', { title: 'Updated' });
        expect(prod.title).toBe('Updated');
    });

    it('should find products by seller', async () => {
        const populateChain = { populate: vi.fn().mockResolvedValue([{ title: 'Seller Prod' }]) };
        productModel.find.mockReturnValue(populateChain);

        const prods = await findProductsBySeller('seller-id');
        expect(prods[0].title).toBe('Seller Prod');
        expect(productModel.find).toHaveBeenCalledWith({ seller: 'seller-id' });
        expect(populateChain.populate).toHaveBeenCalledWith('seller');
    });

    it('should count products', async () => {
        productModel.countDocuments.mockResolvedValue(42);
        const count = await countProducts({ active: true });
        expect(count).toBe(42);
        expect(productModel.countDocuments).toHaveBeenCalledWith({ active: true });
    });

    it('should find products paginated', async () => {
        const chain3 = { limit: vi.fn().mockResolvedValue([{ title: 'Paginated' }]) };
        const chain2 = { skip: vi.fn().mockReturnValue(chain3) };
        const chain1 = { sort: vi.fn().mockReturnValue(chain2) };
        const leanChain = { lean: vi.fn().mockReturnValue(chain1) };
        productModel.find.mockReturnValue(leanChain);

        const prods = await findProductsPaginated({
            filter: { active: true },
            sort: { createdAt: -1 },
            skip: 10,
            limit: 5
        });
        expect(prods[0].title).toBe('Paginated');
        expect(productModel.find).toHaveBeenCalledWith({ active: true });
        expect(leanChain.lean).toHaveBeenCalled();
        expect(chain1.sort).toHaveBeenCalledWith({ createdAt: -1 });
        expect(chain2.skip).toHaveBeenCalledWith(10);
        expect(chain3.limit).toHaveBeenCalledWith(5);
    });
});
