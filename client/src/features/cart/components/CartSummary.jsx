import React from 'react';
import { useSelector } from 'react-redux';
import '../styles/_cart-summary.scss';
import { useCart } from '../hooks/useCart';
import { useRazorpay, RazorpayOrderOptions } from 'react-razorpay';

const CartSummary = () => {
    const cartItems = useSelector((state) => state.cart.items);
    const totalCartPrice = useSelector((state) => state.cart.totalCartPrice);
    const { handleCreateCartOrder, handleVerifyOrder } = useCart();
    const user = useSelector((state) => state.auth.user);
    const { error, isLoading, Razorpay } = useRazorpay();

    const isAllItemsInStock = cartItems.every(
        (item) => item.product.variants.isInStock,
    );

    // Calculations
    const subtotal = totalCartPrice?.amount || 0;
    const discount = 0;
    const deliveryFee = 0;
    const total = subtotal - discount + deliveryFee;

    const handleCheckout = async () => {
        if (!isAllItemsInStock) {
            return;
        }
        if (!total) return;
        const order = await handleCreateCartOrder({
            amount: total,
            currency: totalCartPrice.currency,
        });

        const options = {
            key: 'rzp_test_TK2eTkSewvxQHH',
            amount: order.amount,
            currency: order.currency,
            name: 'Sciolto',
            description: 'Test Transaction',
            order_id: order.id, // Generate order_id on server
            handler: async (response) => {
                const isPaymentVerified = await handleVerifyOrder({
                    razorpay_order_id: order.id,
                    razorpay_payment_id: response.razorpay_payment_id,
                    razorpay_signature: response.razorpay_signature,
                });

                if (isPaymentVerified.success) {
                    console.log('Payment verified', isPaymentVerified);
                } else {
                    console.log('Payment not verified', isPaymentVerified);
                }
            },
            prefill: {
                name: user.fullname,
                email: user.email,
                contact: user.contact,
            },
            theme: {
                color: '#000',
            },
        };

        const razorpayInstance = new Razorpay(options);
        razorpayInstance.open();
    };

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

            <button
                className="button primary-button cart-checkout-btn"
                onClick={() => handleCheckout()}
                disabled={!isAllItemsInStock}
            >
                Go to Checkout <i className="ri-arrow-right-line"></i>
            </button>
        </aside>
    );
};

export default CartSummary;
