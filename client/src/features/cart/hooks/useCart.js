import {
    addToCart,
    getCartItems,
    removeFromCart,
    updateCartItem,
    getCartCount,
} from '../service/cart.api';
import { useDispatch } from 'react-redux';
import {
    setError,
    setCartItems,
    setCart,
    setLoading,
    clearCart,
    setCartCountState,
} from '../state/cart.slice';
import { createPaymentOrder, verifyPaymentOrder } from '../../payment/service/payment.api';

export const useCart = () => {
    const dispatch = useDispatch();

    async function handleSetCart() {
        dispatch(setLoading(true));
        dispatch(setError(null));

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
        dispatch(setError(null));

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
        dispatch(setError(null));

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
        dispatch(setError(null));

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

    async function handleCreateCartOrder({ amount, currency }) {
        dispatch(setLoading(true));
        dispatch(setError(null));

        try {
            const data = await createPaymentOrder({ amount, currency });
            return data.razorpayOrder;
        } catch (error) {
            dispatch(setError(error.response?.data?.message ?? error.message));
        } finally {
            dispatch(setLoading(false));
        }
    }

    async function handleVerifyOrder({
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
        addressId,
    }) {
        dispatch(setLoading(true));
        dispatch(setError(null));

        try {
            const data = await verifyPaymentOrder({
                razorpay_order_id,
                razorpay_payment_id,
                razorpay_signature,
                addressId,
            });
            console.log('order verified', data);
            if (data?.success && data?.orders?.length > 0) {
                dispatch(clearCart());
            }
            return data;
        } catch (error) {
            dispatch(setError(error.response?.data?.message ?? error.message));
        } finally {
            dispatch(setLoading(false));
        }
    }

    async function handleFetchCartCount() {
        try {
            const data = await getCartCount();
            dispatch(setCartCountState(data?.count || 0));
        } catch (error) {
            console.error('Failed to fetch cart count', error);
        }
    }

    return {
        handleSetCart,
        handleAddToCart,
        handleRemoveFromCart,
        handleUpdateCartItem,
        handleCreateCartOrder,
        handleVerifyOrder,
        handleFetchCartCount,
    };
};
