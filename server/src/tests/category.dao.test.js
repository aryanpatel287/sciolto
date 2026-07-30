import { describe, it, expect, vi, beforeEach } from 'vitest';
import { findCategoryBySlugOrName } from '../dao/category.dao.js';
import categoryModel from '../models/category.model.js';

// Mock Mongoose Category Model
vi.mock('../models/category.model.js', () => ({
    default: {
        findOne: vi.fn(),
    },
}));

describe('Category DAO Extensions', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should search category by slug or name', async () => {
        const mockCategory = { _id: 'cat-id', name: 'Hoodies', slug: 'hoodies' };
        categoryModel.findOne.mockResolvedValue(mockCategory);

        const category = await findCategoryBySlugOrName('Hoodies');
        expect(category).toBe(mockCategory);
        expect(categoryModel.findOne).toHaveBeenCalledWith({
            $or: [
                { slug: 'hoodies' },
                { name: { $regex: '^Hoodies$', $options: 'i' } },
            ],
        });
    });
});
