import {
    createAddress,
    getUserAddresses,
    updateAddress,
    deleteAddress,
} from '../dao/address.dao.js';
import { sendResponse } from '../utils/response.utlis.js';

export async function createAddressController(req, res) {
    try {
        const address = await createAddress(req.user._id, req.body);
        return await sendResponse({
            res,
            statusCode: 201,
            success: true,
            message: 'Address created successfully',
            address,
        });
    } catch (error) {
        console.error('Error in createAddressController:', error);
        return await sendResponse({
            res,
            statusCode: 500,
            success: false,
            message: 'Internal Server Error',
            error: error.message,
        });
    }
}

export async function getUserAddressesController(req, res) {
    try {
        const addresses = await getUserAddresses(req.user._id);
        return await sendResponse({
            res,
            statusCode: 200,
            success: true,
            message: 'Addresses fetched successfully',
            addresses,
        });
    } catch (error) {
        console.error('Error in getUserAddressesController:', error);
        return await sendResponse({
            res,
            statusCode: 500,
            success: false,
            message: 'Internal Server Error',
            error: error.message,
        });
    }
}

export async function updateAddressController(req, res) {
    try {
        const address = await updateAddress(req.params.addressId, req.user._id, req.body);
        if (!address) {
            return await sendResponse({
                res,
                statusCode: 404,
                success: false,
                message: 'Address not found or unauthorized',
            });
        }
        return await sendResponse({
            res,
            statusCode: 200,
            success: true,
            message: 'Address updated successfully',
            address,
        });
    } catch (error) {
        console.error('Error in updateAddressController:', error);
        return await sendResponse({
            res,
            statusCode: 500,
            success: false,
            message: 'Internal Server Error',
            error: error.message,
        });
    }
}

export async function deleteAddressController(req, res) {
    try {
        const address = await deleteAddress(req.params.addressId, req.user._id);
        if (!address) {
            return await sendResponse({
                res,
                statusCode: 404,
                success: false,
                message: 'Address not found or unauthorized',
            });
        }
        return await sendResponse({
            res,
            statusCode: 200,
            success: true,
            message: 'Address deleted successfully',
        });
    } catch (error) {
        console.error('Error in deleteAddressController:', error);
        return await sendResponse({
            res,
            statusCode: 500,
            success: false,
            message: 'Internal Server Error',
            error: error.message,
        });
    }
}
