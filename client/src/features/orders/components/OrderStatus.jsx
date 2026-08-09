import React from 'react';

const OrderStatus = ({ status }) => {
    const getStatusLabel = () => {
        switch (status) {
            case 'paid': return 'PAID';
            case 'failed': return 'FAILED';
            default: return 'PENDING';
        }
    };

    return (
        <span className={`order-status order-status--${status}`}>
            {getStatusLabel()}
        </span>
    );
};

export default OrderStatus;
