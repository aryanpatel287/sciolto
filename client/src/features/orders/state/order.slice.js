import { createSlice } from '@reduxjs/toolkit';
import { getUserOrders } from '../service/order.api';

const orderSlice = createSlice({
    name: 'order',
    initialState: {
        orders: [],
        loading: false,
        error: null,
    },
    reducers: {
        setOrders: (state, action) => {
            state.orders = action.payload;
        },
        setLoading: (state, action) => {
            state.loading = action.payload;
        },
        setError: (state, action) => {
            state.error = action.payload;
        },
    },
});

export const { setOrders, setLoading, setError } = orderSlice.actions;

export const fetchUserOrders = () => async (dispatch) => {
    dispatch(setLoading(true));
    dispatch(setError(null));
    try {
        const data = await getUserOrders();
        dispatch(setOrders(data.orders || []));
    } catch (error) {
        dispatch(setError(error.response?.data?.message ?? error.message));
    } finally {
        dispatch(setLoading(false));
    }
};

export default orderSlice.reducer;
