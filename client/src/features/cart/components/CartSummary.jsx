import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, useSearchParams } from 'react-router';
import '../styles/_cart-summary.scss';
import { useCart } from '../hooks/useCart';
import { useRazorpay, RazorpayOrderOptions } from 'react-razorpay';
import { useAddress } from '../../user/hooks/useAddress';
import AddressSelectModal from './AddressSelectModal';

const CartSummary = () => {
    const cartItems = useSelector((state) => state.cart.items);
    const totalCartPrice = useSelector((state) => state.cart.totalCartPrice);
    const { handleCreateCartOrder, handleVerifyOrder } = useCart();
    const user = useSelector((state) => state.auth.user);
    const { error, isLoading, Razorpay } = useRazorpay();

    const isAllItemsInStock = cartItems.every(
        (item) => item.product.variants.isInStock,
    );

        const addresses = useSelector((state) => state.address.addresses);
    const { handleFetchAddresses } = useAddress();
    const [selectedAddressId, setSelectedAddressId] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);

    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const selectAddressIdParam = searchParams.get('selectAddressId');

    useEffect(() => {
        handleFetchAddresses();
    }, []);

    useEffect(() => {
        if (addresses && addresses.length > 0) {
            if (selectAddressIdParam) {
                setSelectedAddressId(selectAddressIdParam);
                const params = new URLSearchParams(searchParams);
                params.delete('selectAddressId');
                setSearchParams(params);
            } else if (!selectedAddressId) {
                setSelectedAddressId(addresses[0]._id);
            }
        }
    }, [addresses, selectAddressIdParam]);

    const selectedAddress = addresses && addresses.length > 0
        ? (addresses.find((addr) => addr._id === selectedAddressId) || addresses[0])
        : null;

    useEffect(() => {
        if (selectedAddress && selectedAddress._id !== selectedAddressId) {
            setSelectedAddressId(selectedAddress._id);
        }
    }, [selectedAddress, selectedAddressId]);

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
                    addressId: selectedAddressId,
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

            <div className="cart-checkout-address-section">
                <div className="address-info-row">
                    <div className="delivery-icon">
                        <i className="ri-truck-line"></i>
                    </div>
                    {selectedAddress ? (
                        <div className="address-details">
                            <div className="address-header-text">
                                Delivering to <strong>{selectedAddress.name}, {selectedAddress.pincode}</strong>
                            </div>
                            <div className="address-body-text">
                                {selectedAddress.addressLine1}{selectedAddress.addressLine2 ? `, ${selectedAddress.addressLine2}` : ''}, {selectedAddress.city}
                            </div>
                        </div>
                    ) : (
                        <div className="address-details">
                            <div className="address-header-text">
                                No shipping address found.
                            </div>
                        </div>
                    )}
                    
                    {selectedAddress ? (
                        <button
                            type="button"
                            onClick={() => setIsModalOpen(true)}
                            className="change-address-btn"
                        >
                            CHANGE
                        </button>
                    ) : (
                        <button
                            type="button"
                            onClick={() => navigate('/profile?tab=addresses&action=add&redirect=/cart')}
                            className="change-address-btn"
                        >
                            ADD ADDRESS
                        </button>
                    )}
                </div>
            </div>

            <AddressSelectModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                addresses={addresses}
                selectedAddressId={selectedAddressId}
                onSelect={(id) => setSelectedAddressId(id)}
                onAddNew={() => navigate('/profile?tab=addresses&action=add&redirect=/cart')}
                onEdit={(id) => navigate(`/profile?tab=addresses&action=edit&addressId=${id}&redirect=/cart`)}
            />

            <button
                className="button primary-button cart-checkout-btn"
                onClick={() => handleCheckout()}
                disabled={!isAllItemsInStock || !selectedAddressId}
            >
                Go to Checkout <i className="ri-arrow-right-line"></i>
            </button>
        </aside>
    );
};

export default CartSummary;
