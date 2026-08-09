import React from 'react';

const OrderItems = ({ items }) => {
    return (
        <div className="order-items">
            {items.map((item, idx) => {
                const product = item.product || {};
                const variant = product.variants?.find(v => v._id === item.variant) || {};
                const size = variant.attributes?.size || variant.attributes?.Size || '';
                const color = variant.attributes?.color || variant.attributes?.Color || '';
                const displayImage = variant.images?.[0]?.thumbnailUrl || variant.images?.[0]?.url || product.images?.[0]?.thumbnailUrl || product.images?.[0]?.url || '';

                return (
                    <div className="order-items__item" key={idx}>
                        {displayImage ? (
                            <img
                                className="order-items__img"
                                src={displayImage}
                                alt={product.title || 'Product'}
                            />
                        ) : (
                            <div className="order-items__img-placeholder"></div>
                        )}
                        <div className="order-items__details">
                            <h4 className="order-items__name">{product.title || 'Unknown Product'}</h4>
                            <div className="order-items__meta">
                                {size && <span>Size: {size}</span>}
                                {color && <span>Color: {color}</span>}
                                <span>Qty: {item.quantity}</span>
                            </div>
                            <span className="order-items__price">₹{item.price?.amount}</span>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default OrderItems;
