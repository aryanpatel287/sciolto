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
import {
    createPaymentOrder,
    verifyPaymentOrder,
} from '../../payment/service/payment.api';

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
    }) {
        dispatch(setLoading(true));
        dispatch(setError(null));

        try {
            const data = await verifyPaymentOrder({
                razorpay_order_id,
                razorpay_payment_id,
                razorpay_signature,
            });
            console.log('order verified', data);
            return data;
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
        handleCreateCartOrder,
        handleVerifyOrder,
    };
};
