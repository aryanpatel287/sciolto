import { createSlice } from '@reduxjs/toolkit';

const cartSlice = createSlice({
    name: 'cart',
    initialState: {
        items: [],
        totalCartPrice: { amount: 0, currency: '' },
        loading: false,
        error: null,
    },
    reducers: {
        setCart: (state, action) => {
            state.items = action.payload.items;
            state.totalCartPrice = action.payload.totalCartPrice;
        },
        setCartItems: (state, action) => {
            state.items = action.payload;
        },
        addItem: (state, action) => {
            state.items.push(action.payload);
        },
        setLoading: (state, action) => {
            state.loading = action.payload;
        },
        setError: (state, action) => {
            state.error = action.payload;
        },
        clearCart: (state) => {
            state.items = [];
            state.totalCartPrice = { amount: 0, currency: '' };
        },
    },
});

export const { setCartItems, setCart, addItem, setLoading, setError, clearCart } =
    cartSlice.actions;
export default cartSlice.reducer;
