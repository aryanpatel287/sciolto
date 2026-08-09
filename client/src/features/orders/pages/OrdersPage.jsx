import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUserOrders } from '../state/order.slice';
import OrderCard from '../components/OrderCard';
import { useNavigate } from 'react-router';
import '../styles/_orders.scss';

const OrdersPage = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { orders, loading, error } = useSelector((state) => state.order);

    useEffect(() => {
        dispatch(fetchUserOrders());
    }, [dispatch]);

    const handleRetry = () => {
        dispatch(fetchUserOrders());
    };

    if (loading) {
        return (
            <div className="orders-page orders-page--loading">
                <h1 className="orders-page__title">MY ORDERS</h1>
                <div className="orders-page__skeleton-list">
                    <div className="orders-page__skeleton-card"></div>
                    <div className="orders-page__skeleton-card"></div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="orders-page orders-page--error">
                <h1 className="orders-page__title">MY ORDERS</h1>
                <p className="orders-page__error-msg">Unable to load your orders.</p>
                <button onClick={handleRetry} className="orders-page__btn">TRY AGAIN</button>
            </div>
        );
    }

    if (!orders || orders.length === 0) {
        return (
            <div className="orders-page orders-page--empty">
                <h1 className="orders-page__title">MY ORDERS</h1>
                <p className="orders-page__empty-msg">You haven't placed any orders yet.</p>
                <button onClick={() => navigate('/products')} className="orders-page__btn">START SHOPPING</button>
            </div>
        );
    }

    return (
        <div className="orders-page">
            <h1 className="orders-page__title">MY ORDERS</h1>
            <div className="orders-page__list">
                {orders.map((order) => (
                    <OrderCard key={order._id} order={order} />
                ))}
            </div>
        </div>
    );
};

export default OrdersPage;
