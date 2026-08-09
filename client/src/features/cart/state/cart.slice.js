import { createSlice } from '@reduxjs/toolkit';

const cartSlice = createSlice({
    name: 'cart',
    initialState: {
        items: [],
        totalCartPrice: { amount: 0, currency: '' },
        cartCount: 0,
        loading: false,
        error: null,
    },
    reducers: {
        setCart: (state, action) => {
            state.items = action.payload.items;
            state.totalCartPrice = action.payload.totalCartPrice;
            state.cartCount = action.payload.items ? action.payload.items.reduce((sum, item) => sum + item.quantity, 0) : 0;
        },
        setCartItems: (state, action) => {
            state.items = action.payload;
            state.cartCount = action.payload ? action.payload.reduce((sum, item) => sum + item.quantity, 0) : 0;
        },
        setCartCountState: (state, action) => {
            state.cartCount = action.payload;
        },
        addItem: (state, action) => {
            state.items.push(action.payload);
            state.cartCount += action.payload.quantity || 1;
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
            state.cartCount = 0;
        },
    },
});

export const { setCartItems, setCart, setCartCountState, addItem, setLoading, setError, clearCart } =
    cartSlice.actions;
export default cartSlice.reducer;
