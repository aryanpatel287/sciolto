import { Router } from 'express';
import { authUser } from '../middlewares/auth.middleware.js';
import { validateAddress } from '../validators/address.validator.js';
import {
    createAddressController,
    getUserAddressesController,
    updateAddressController,
    deleteAddressController,
} from '../controllers/address.controller.js';

const addressRouter = Router();

addressRouter.post('/', authUser, validateAddress, createAddressController);
addressRouter.get('/', authUser, getUserAddressesController);
addressRouter.put('/:addressId', authUser, validateAddress, updateAddressController);
addressRouter.delete('/:addressId', authUser, deleteAddressController);

export default addressRouter;
