import { createSlice } from '@reduxjs/toolkit';

const addressSlice = createSlice({
    name: 'address',
    initialState: {
        addresses: [],
        loading: false,
        error: null,
    },
    reducers: {
        setAddresses: (state, action) => {
            state.addresses = action.payload;
        },
        addAddressState: (state, action) => {
            state.addresses.push(action.payload);
        },
        updateAddressState: (state, action) => {
            state.addresses = state.addresses.map((addr) =>
                addr._id === action.payload._id ? action.payload : addr
            );
        },
        deleteAddressState: (state, action) => {
            state.addresses = state.addresses.filter((addr) => addr._id !== action.payload);
        },
        setAddressLoading: (state, action) => {
            state.loading = action.payload;
        },
        setAddressError: (state, action) => {
            state.error = action.payload;
        },
    },
});

export const {
    setAddresses,
    addAddressState,
    updateAddressState,
    deleteAddressState,
    setAddressLoading,
    setAddressError,
} = addressSlice.actions;

export default addressSlice.reducer;
