import axios from 'axios';

const cartApiInstance = axios.create({
    baseURL: '/api/cart',
    withCredentials: true,
});

export const getCartItems = async () => {
    try {
        const response = await cartApiInstance.get('/');
        return response.data;
    } catch (error) {
        console.error('Error fetching cart items', error);
        throw error;
    }
};

export const addToCart = async ({ productId, variantId, quantity }) => {
    try {
        const cleanVariantId =
            variantId && variantId !== 'undefined' && variantId !== 'null'
                ? variantId
                : null;
        const response = await cartApiInstance.post(
            `add/${productId}${cleanVariantId ? `/${cleanVariantId}` : ''}`,
            {
                quantity,
            },
        );
        return response.data;
    } catch (error) {
        console.error('Error adding to cart', error);
        throw error;
    }
};

export const removeFromCart = async ({ productId, variantId }) => {
    try {
        const cleanVariantId =
            variantId && variantId !== 'undefined' && variantId !== 'null'
                ? variantId
                : null;
        const response = await cartApiInstance.post(
            `remove/${productId}${cleanVariantId ? `/${cleanVariantId}` : ''}`,
        );
        return response.data;
    } catch (error) {
        console.error('Error removing from cart', error);
        throw error;
    }
};

export const updateCartItem = async ({ productId, variantId, quantity }) => {
    try {
        const cleanVariantId =
            variantId && variantId !== 'undefined' && variantId !== 'null'
                ? variantId
                : null;
        const response = await cartApiInstance.post(
            `update/${productId}${cleanVariantId ? `/${cleanVariantId}` : ''}`,
            {
                quantity,
            },
        );
        return response.data;
    } catch (error) {
        console.error('Error updating cart item', error);
        throw error;
    }
};

export const getCartCount = async () => {
    try {
        const response = await cartApiInstance.get('/count');
        return response.data;
    } catch (error) {
        console.error('Error fetching cart count', error);
        throw error;
    }
};

