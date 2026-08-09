import addressModel from '../models/address.model.js';

export async function createAddress(userId, addressData) {
    return await addressModel.create({
        ...addressData,
        user: userId,
    });
}

export async function getUserAddresses(userId) {
    return await addressModel.find({ user: userId }).lean();
}

export async function getAddressById(addressId, userId) {
    return await addressModel.findOne({ _id: addressId, user: userId }).lean();
}

export async function updateAddress(addressId, userId, updateData) {
    return await addressModel.findOneAndUpdate(
        { _id: addressId, user: userId },
        updateData,
        { new: true }
    ).lean();
}

export async function deleteAddress(addressId, userId) {
    return await addressModel.findOneAndDelete({ _id: addressId, user: userId });
}
