import {
    addToCart,
    getCartItems,
    removeFromCart,
    updateCartItem,
} from '../service/cart.api';
import { useDispatch } from 'react-redux';
import {
    setError,
    setCartItems,
    setCart,
    setLoading,
} from '../state/cart.slice';

export const useCart = () => {
    const dispatch = useDispatch();

    async function handleSetCart() {
        dispatch(setLoading(true));
        try {
            const data = await getCartItems();
            dispatch(setCart(data?.cart));
        } catch (error) {
            dispatch(setError(error.response?.data?.message ?? error.message));
        } finally {
            dispatch(setLoading(false));
        }
    }

    async function handleAddToCart({ productId, variantId, quantity }) {
        dispatch(setLoading(true));
        try {
            const data = await addToCart({ productId, variantId, quantity });
            dispatch(setCart(data?.cart));
        } catch (error) {
            dispatch(setError(error.response?.data?.message ?? error.message));
        } finally {
            dispatch(setLoading(false));
        }
    }

    async function handleRemoveFromCart({ productId, variantId }) {
        dispatch(setLoading(true));
        try {
            const data = await removeFromCart({ productId, variantId });
            dispatch(setCart(data?.cart));
        } catch (error) {
            dispatch(setError(error.response?.data?.message ?? error.message));
        } finally {
            dispatch(setLoading(false));
        }
    }

    async function handleUpdateCartItem({ productId, variantId, quantity }) {
        dispatch(setLoading(true));
        try {
            const data = await updateCartItem({
                productId,
                variantId,
                quantity,
            });
            dispatch(setCart(data?.cart));
        } catch (error) {
            dispatch(setError(error.response?.data?.message ?? error.message));
        } finally {
            dispatch(setLoading(false));
        }
    }

    return {
        handleSetCart,
        handleAddToCart,
        handleRemoveFromCart,
        handleUpdateCartItem,
    };
};
