import { describe, it, expect, vi, beforeEach } from 'vitest';
import addressModel from '../models/address.model.js';
import {
    createAddress,
    getUserAddresses,
    getAddressById,
    updateAddress,
    deleteAddress,
} from '../dao/address.dao.js';

vi.mock('../models/address.model.js', () => ({
    default: {
        create: vi.fn(),
        find: vi.fn(),
        findOne: vi.fn(),
        findOneAndUpdate: vi.fn(),
        findOneAndDelete: vi.fn(),
    },
}));

describe('Address DAO tests', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should create an address', async () => {
        const payload = { name: 'Test', pincode: '110001' };
        addressModel.create.mockResolvedValue({ ...payload, user: 'u1' });

        const res = await createAddress('u1', payload);
        expect(res.user).toBe('u1');
        expect(addressModel.create).toHaveBeenCalledWith({ ...payload, user: 'u1' });
    });

    it('should find addresses by userId', async () => {
        const mockFind = { lean: vi.fn().mockResolvedValue([{ name: 'Test' }]) };
        addressModel.find.mockReturnValue(mockFind);

        const res = await getUserAddresses('u1');
        expect(res).toHaveLength(1);
        expect(addressModel.find).toHaveBeenCalledWith({ user: 'u1' });
    });

    it('should get address by id and userId', async () => {
        const mockFindOne = { lean: vi.fn().mockResolvedValue({ _id: 'a1', user: 'u1' }) };
        addressModel.findOne.mockReturnValue(mockFindOne);

        const res = await getAddressById('a1', 'u1');
        expect(res._id).toBe('a1');
        expect(addressModel.findOne).toHaveBeenCalledWith({ _id: 'a1', user: 'u1' });
    });

    it('should update address', async () => {
        const mockUpdate = { lean: vi.fn().mockResolvedValue({ name: 'Updated' }) };
        addressModel.findOneAndUpdate.mockReturnValue(mockUpdate);

        const res = await updateAddress('a1', 'u1', { name: 'Updated' });
        expect(res.name).toBe('Updated');
        expect(addressModel.findOneAndUpdate).toHaveBeenCalledWith(
            { _id: 'a1', user: 'u1' },
            { name: 'Updated' },
            { new: true }
        );
    });

    it('should delete address', async () => {
        addressModel.findOneAndDelete.mockResolvedValue({ _id: 'a1' });

        const res = await deleteAddress('a1', 'u1');
        expect(res._id).toBe('a1');
        expect(addressModel.findOneAndDelete).toHaveBeenCalledWith({ _id: 'a1', user: 'u1' });
    });
});
