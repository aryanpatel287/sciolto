import categoryModel from '../models/category.model.js';

async function findAllCategories() {
    const categories = await categoryModel
        .find({ isActive: true })
        .populate('children')
        .exec();

    return categories;
}

async function findCategoryBySlugOrName(category) {
    return await categoryModel.findOne({
        $or: [
            { slug: category.toLowerCase() },
            { name: { $regex: `^${category}$`, $options: 'i' } },
        ],
    });
}

export { findAllCategories, findCategoryBySlugOrName };
