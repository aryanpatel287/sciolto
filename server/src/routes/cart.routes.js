import { Router } from 'express';
import {
    validateAddToCart,
    validateRemoveFromCart,
    validateUpdateCartItem,
} from '../validators/cart.validator.js';
import { authUser } from '../middlewares/auth.middleware.js';
import {
    addToCartController,
    getCartController,
    removeFromCartController,
    updateCartItemController,
    getCartItemsCountController,
} from '../controllers/cart.controller.js';

const cartRouter = new Router();

/**
 * @route POST /api/cart/add/:productId/:variantId
 * @desc Add a product to cart
 * @access Private
 * @argument productId - The ID of the product to add to the cart
 * @argument variantId - The ID of the product variant to add to the cart
 * @argument quantity - The quantity of the product to add to the cart (optional, default is 1)
 */
cartRouter.post(
    '/add/:productId/:variantId',
    authUser,
    validateAddToCart,
    addToCartController,
);

/**
 * @route POST /api/cart/add/:productId
 * @desc Add a product to cart
 * @access Private
 * @argument productId - The ID of the product to add to the cart
 * @argument quantity - The quantity of the product to add to the cart (optional, default is 1)
 */
cartRouter.post(
    '/add/:productId',
    authUser,
    validateAddToCart,
    addToCartController,
);

/**
 * @route GET /api/cart
 * @desc Get the current user's cart
 * @access Private
 * @body No body required
 */
cartRouter.get('/', authUser, getCartController);

/**
 * @route GET /api/cart/count
 * @desc Get cart items count
 * @access Private
 */
cartRouter.get('/count', authUser, getCartItemsCountController);

/**
 * @route POST /api/cart/remove/:productId/:variantId
 * @desc Remove a product from cart
 * @access Private
 * @argument productId - The ID of the product to remove from the cart
 * @argument variantId - The ID of the product variant to remove from the cart (optional)
 */
cartRouter.post(
    '/remove/:productId/:variantId',
    authUser,
    validateRemoveFromCart,
    removeFromCartController,
);

/**
 * @route POST /api/cart/remove/:productId
 * @desc Remove a product from cart
 * @access Private
 * @argument productId - The ID of the product to remove from the cart
 */
cartRouter.post(
    '/remove/:productId',
    authUser,
    validateRemoveFromCart,
    removeFromCartController,
);

/**
 * @route POST /api/cart/update/:productId/:variantId
 * @desc Update the quantity of a product in the cart
 * @access Private
 * @argument productId - The ID of the product to update in the cart
 * @argument variantId - The ID of the product variant to update in the cart (optional)
 * @argument quantity - The new quantity of the product in the cart
 */
cartRouter.post(
    '/update/:productId/:variantId',
    authUser,
    validateUpdateCartItem,
    updateCartItemController,
);

/**
 * @route POST /api/cart/update/:productId
 * @desc Update the quantity of a product in the cart
 * @access Private
 * @argument productId - The ID of the product to update in the cart
 * @argument quantity - The new quantity of the product in the cart
 */
cartRouter.post(
    '/update/:productId',
    authUser,
    validateUpdateCartItem,
    updateCartItemController,
);

export default cartRouter;
