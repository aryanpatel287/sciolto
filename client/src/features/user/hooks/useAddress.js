import { useDispatch } from 'react-redux';
import {
    fetchAddresses,
    createAddress,
    updateAddress,
    deleteAddress,
} from '../service/address.api';
import {
    setAddresses,
    addAddressState,
    updateAddressState,
    deleteAddressState,
    setAddressLoading,
    setAddressError,
} from '../state/address.slice';

export const useAddress = () => {
    const dispatch = useDispatch();

    async function handleFetchAddresses() {
        dispatch(setAddressLoading(true));
        dispatch(setAddressError(null));
        try {
            const data = await fetchAddresses();
            dispatch(setAddresses(data.addresses || []));
        } catch (error) {
            dispatch(setAddressError(error.response?.data?.message ?? error.message));
        } finally {
            dispatch(setAddressLoading(false));
        }
    }

    async function handleCreateAddress(addressData) {
        dispatch(setAddressLoading(true));
        dispatch(setAddressError(null));
        try {
            const data = await createAddress(addressData);
            dispatch(addAddressState(data.address));
            return data.address;
        } catch (error) {
            dispatch(setAddressError(error.response?.data?.message ?? error.message));
            throw error;
        } finally {
            dispatch(setAddressLoading(false));
        }
    }

    async function handleUpdateAddress(id, addressData) {
        dispatch(setAddressLoading(true));
        dispatch(setAddressError(null));
        try {
            const data = await updateAddress(id, addressData);
            dispatch(updateAddressState(data.address));
            return data.address;
        } catch (error) {
            dispatch(setAddressError(error.response?.data?.message ?? error.message));
            throw error;
        } finally {
            dispatch(setAddressLoading(false));
        }
    }

    async function handleDeleteAddress(id) {
        dispatch(setAddressLoading(true));
        dispatch(setAddressError(null));
        try {
            await deleteAddress(id);
            dispatch(deleteAddressState(id));
        } catch (error) {
            dispatch(setAddressError(error.response?.data?.message ?? error.message));
        } finally {
            dispatch(setAddressLoading(false));
        }
    }

    return {
        handleFetchAddresses,
        handleCreateAddress,
        handleUpdateAddress,
        handleDeleteAddress,
    };
};
