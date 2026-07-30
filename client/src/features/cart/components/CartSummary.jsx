import React from 'react';
import { useSelector } from 'react-redux';
import '../styles/_cart-summary.scss';

const CartSummary = () => {
    const cartItems = useSelector((state) => state.cart.items);
    const totalCartPrice = useSelector((state) => state.cart.totalCartPrice);

    // Calculations
    const subtotal = totalCartPrice?.amount || 0;
    const discount = 0;
    const deliveryFee = 0;
    const total = subtotal - discount + deliveryFee;

    return (
        <aside className="cart-summary-card">
            <h2 className="cart-summary-card__title">Order Summary</h2>

            <div className="cart-summary-row">
                <span className="cart-summary-row__label">Subtotal</span>
                <span className="cart-summary-row__value">
                    ₹{subtotal.toFixed(2)}
                </span>
            </div>

            <div className="cart-summary-row cart-summary-row--discount">
                <span className="cart-summary-row__label">Discount</span>
                <span className="cart-summary-row__value">
                    -₹{discount.toFixed(2)}
                </span>
            </div>

            <div className="cart-summary-row">
                <span className="cart-summary-row__label">Delivery Fee</span>
                <span className="cart-summary-row__value">
                    ₹{deliveryFee.toFixed(2)}
                </span>
            </div>

            <hr className="cart-summary-divider" />

            <div className="cart-summary-row cart-summary-row--total">
                <span className="cart-summary-row__label">Total</span>
                <span className="cart-summary-row__value">
                    ₹{total.toFixed(2)}
                </span>
            </div>

            <div className="cart-promo-section">
                <div className="cart-promo-input-wrapper">
                    <i className="ri-price-tag-3-line cart-promo-icon"></i>
                    <input
                        type="text"
                        placeholder="Add promo code"
                        className="cart-promo-input"
                    />
                </div>
                <button className="button primary-button cart-promo-apply-btn">
                    Apply
                </button>
            </div>

            <button className="button primary-button cart-checkout-btn">
                Go to Checkout <i className="ri-arrow-right-line"></i>
            </button>
        </aside>
    );
};

export default CartSummary;
