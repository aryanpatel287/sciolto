import React from 'react';
import OrderStatus from './OrderStatus';
import OrderItems from './OrderItems';

const OrderCard = ({ order }) => {
    const dateStr = new Date(order.createdAt).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
    });

    return (
        <div className="order-card">
            <div className="order-card__header">
                <div>
                    <span className="order-card__id">ORDER #{order._id}</span>
                    <span className="order-card__date">{dateStr}</span>
                </div>
                <OrderStatus status={order.status} />
            </div>
            <div className="order-card__body">
                <OrderItems items={order.items || []} />
            </div>
            <div className="order-card__footer">
                <span className="order-card__total-label">Total</span>
                <span className="order-card__total-value">₹{order.totalPrice?.amount}</span>
            </div>
        </div>
    );
};

export default OrderCard;
