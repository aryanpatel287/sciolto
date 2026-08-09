import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router';
import Navbar from '../../shared/components/Navbar';
import '../styles/_order-summary.scss';

const OrderSummaryPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { orders, paymentOrder } = location.state || {};

    useEffect(() => {
        // Scroll to top on mount
        window.scrollTo(0, 0);
    }, []);

    if (!orders || orders.length === 0) {
        return (
            <div className="order-summary-page">
                <Navbar />
                <main className="order-summary-main">
                    <div className="order-summary-container order-summary-container--empty">
                        <h1 className="order-summary-title">No Recent Order Found</h1>
                        <p className="order-summary-text">
                            We couldn't find any recent order details. Please check your order history.
                        </p>
                        <button
                            onClick={() => navigate('/profile?tab=orders')}
                            className="order-summary-btn"
                        >
                            View Order History
                        </button>
                    </div>
                </main>
            </div>
        );
    }

    // Accumulate total amount across all split orders
    const totalAmount = orders.reduce((sum, order) => sum + (order.totalPrice?.amount || 0), 0);
    const firstOrder = orders[0];
    const currencySymbol = '₹';

    return (
        <div className="order-summary-page">
            <Navbar />
            <main className="order-summary-main">
                <div className="order-summary-container">
                    <div className="order-summary-success-card">
                        <div className="order-summary-success-card__icon">
                            <i className="ri-checkbox-circle-fill"></i>
                        </div>
                        <h1 className="order-summary-title">Order Placed Successfully!</h1>
                        <p className="order-summary-text">
                            Thank you for your purchase. Your payment has been verified, and your order is now being processed.
                        </p>
                    </div>

                    <div className="order-summary-details">
                        <h2 className="order-summary-section-title">Receipt Details</h2>
                        
                        <div className="order-summary-meta">
                            {paymentOrder?.razorpay?.paymentId && (
                                <div className="order-summary-meta__row">
                                    <span>Payment ID</span>
                                    <strong>{paymentOrder.razorpay.paymentId}</strong>
                                </div>
                            )}
                            <div className="order-summary-meta__row">
                                <span>Total Paid</span>
                                <strong className="order-summary-meta__total">{currencySymbol}{totalAmount}</strong>
                            </div>
                        </div>

                        <div className="order-summary-orders-list">
                            {orders.map((order, orderIdx) => (
                                <div className="order-summary-order-block" key={order._id || orderIdx}>
                                    <h3 className="order-summary-order-block__title">
                                        Order #{order._id}
                                    </h3>
                                    <div className="order-summary-order-block__items">
                                        {order.items?.map((item, itemIdx) => {
                                            // Handle cases where item details are populated or nested
                                            const product = item.product || {};
                                            const variant = product.variants?.find(v => v._id === item.variant) || {};
                                            const size = variant.attributes?.size || variant.attributes?.Size || '';
                                            const color = variant.attributes?.color || variant.attributes?.Color || '';
                                            const displayImage = variant.images?.[0]?.thumbnailUrl || variant.images?.[0]?.url || product.images?.[0]?.thumbnailUrl || product.images?.[0]?.url || '';

                                            return (
                                                <div className="order-summary-item" key={itemIdx}>
                                                    {displayImage && (
                                                        <img
                                                            src={displayImage}
                                                            alt={product.title || 'Product'}
                                                            className="order-summary-item__img"
                                                        />
                                                    )}
                                                    <div className="order-summary-item__info">
                                                        <h4 className="order-summary-item__name">
                                                            {product.title || 'Streetwear Item'}
                                                        </h4>
                                                        <p className="order-summary-item__meta">
                                                            {size && <span>Size: {size}</span>}
                                                            {color && <span>Color: {color}</span>}
                                                            <span>Qty: {item.quantity}</span>
                                                        </p>
                                                    </div>
                                                    <span className="order-summary-item__price">
                                                        {currencySymbol}{item.price?.amount || 0}
                                                    </span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                    <div className="order-summary-order-block__footer">
                                        <span>Order Total</span>
                                        <strong>{currencySymbol}{order.totalPrice?.amount}</strong>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="order-summary-actions">
                        <button
                            onClick={() => navigate('/profile?tab=orders')}
                            className="order-summary-btn order-summary-btn--primary"
                        >
                            View All Orders
                        </button>
                        <button
                            onClick={() => navigate('/products')}
                            className="order-summary-btn order-summary-btn--secondary"
                        >
                            Continue Shopping
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default OrderSummaryPage;
