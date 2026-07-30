import React, { useEffect } from 'react';
import Navbar from '../../shared/components/Navbar';
import Footer from '../../landing/components/Footer';
import { useSelector } from 'react-redux';
import { useCart } from '../hooks/useCart';
import CartBreadcrumbs from '../components/CartBreadcrumbs';
import CartEmptyState from '../components/CartEmptyState';
import CartItemsList from '../components/CartItemsList';
import CartSummary from '../components/CartSummary';
import '../styles/_cart-page.scss';

const CartPage = () => {
    const cartItems = useSelector((state) => state.cart.items);
    const { handleSetCart } = useCart();

    // Load cart items on mount
    useEffect(() => {
        handleSetCart();
    }, []);

    return (
        <div className="cart-page-container">
            <Navbar />

            <main className="cart-page-main" id="main-content">
                <CartBreadcrumbs />

                <h1 className="cart-title">YOUR CART</h1>

                {cartItems.length === 0 ? (
                    <CartEmptyState />
                ) : (
                    <div className="cart-layout">
                        <CartItemsList />
                        <CartSummary />
                    </div>
                )}
            </main>

            <Footer />
        </div>
    );
};

export default CartPage;
