import React from 'react';
import { Link } from 'react-router';
import { useCart } from '../hooks/useCart';
import '../styles/_cart-item-card.scss';

const CartItemCard = ({ item }) => {
    const { handleRemoveFromCart, handleUpdateCartItem } = useCart();

    const updateQuantity = (change) => {
        handleUpdateCartItem({
            productId: item.product?._id,
            variantId: item.variant,
            quantity: change,
        });
    };

    const removeItem = () => {
        handleRemoveFromCart({
            productId: item.product?._id,
            variantId: item.variant,
        });
    };

    // Helper to safely extract title, image, and dynamic attributes from cart item
    const getCartItemDetails = (item) => {
        const product = item.product;
        if (!product) return {};

        let title = product.title;
        let image = product.images?.[0]?.url || '';
        let attributes = [];

        if (item.variant) {
            const variantObj = product.variants;
            if (variantObj) {
                if (variantObj.images?.length > 0) {
                    image = variantObj.images[0].url;
                }
                const attrs =
                    variantObj.attributes instanceof Map
                        ? Object.fromEntries(variantObj.attributes)
                        : variantObj.attributes || {};

                attributes = Object.entries(attrs).map(([key, val]) => ({
                    name: key.charAt(0).toUpperCase() + key.slice(1), // capitalize key name
                    value: val,
                }));
            }
        }

        return { title, image, attributes };
    };

    const { title, image, attributes } = getCartItemDetails(item);

    return (
        <div className="cart-item-card">
            <Link
                to={`/products/${item.product?._id}`}
                className="cart-item-card__img-container"
            >
                <img src={image} alt={title} className="cart-item-card__img" />
            </Link>

            <div className="cart-item-card__details">
                <div className="cart-item-card__header">
                    <Link
                        to={`/products/${item.product?._id}`}
                        className="cart-item-card__title"
                    >
                        {title}
                    </Link>
                    <button
                        className="cart-item-card__delete-btn"
                        onClick={removeItem}
                        aria-label="Remove item"
                    >
                        <i className="ri-delete-bin-fill"></i>
                    </button>
                </div>

                <p className="cart-item-card__attr">
                    {attributes &&
                        attributes.map((attr) => (
                            <span key={attr.name}>
                                {attr.name}: <strong>{attr.value}</strong>
                            </span>
                        ))}
                </p>

                <div className="cart-item-card__price-row">
                    <span className="cart-item-card__price">
                        ₹{item.product?.variants?.price?.amount || 0}
                    </span>

                    {/* Quantity Stepper */}
                    <div className="cart-quantity-stepper">
                        <button
                            className="cart-quantity-stepper__btn"
                            onClick={() => updateQuantity(-1)}
                            aria-label="Decrease quantity"
                        >
                            <i className="ri-subtract-line"></i>
                        </button>
                        <span className="cart-quantity-stepper__val">
                            {item.quantity}
                        </span>
                        <button
                            className="cart-quantity-stepper__btn"
                            onClick={() => updateQuantity(1)}
                            aria-label="Increase quantity"
                        >
                            <i className="ri-add-line"></i>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CartItemCard;
