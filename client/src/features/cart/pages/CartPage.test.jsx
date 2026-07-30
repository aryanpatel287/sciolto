import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import cartReducer from '../state/cart.slice';
import authReducer from '../../auth/state/auth.slice';
import productReducer from '../../products/state/product.slice';
import CartPage from '../pages/CartPage';
import { getCartItems, addToCart, updateCartItem, removeFromCart } from '../service/cart.api';

vi.mock('../service/cart.api');

// Mock localStorage stub for headless environment
const localStorageMock = (() => {
    let store = {};
    return {
        getItem: (key) => store[key] || null,
        setItem: (key, value) => {
            store[key] = value.toString();
        },
        clear: () => {
            store = {};
        },
        removeItem: (key) => {
            delete store[key];
        },
    };
})();

Object.defineProperty(window, 'localStorage', {
    value: localStorageMock,
    writable: true,
});

describe('CartPage Component', () => {
    let store;

    beforeEach(() => {
        vi.clearAllMocks();
        window.localStorage.clear();

        store = configureStore({
            reducer: {
                cart: cartReducer,
                auth: authReducer,
                product: productReducer,
            },
            preloadedState: {
                cart: { items: [], loading: false, error: null },
                auth: { user: null },
                product: { products: [] }
            }
        });
    });

    const renderWithProvider = (ui) => {
        return render(
            <Provider store={store}>
                <MemoryRouter>
                    {ui}
                </MemoryRouter>
            </Provider>
        );
    };

    it('should render empty state when cart is empty', async () => {
        getCartItems.mockResolvedValueOnce({
            success: true,
            cart: {
                items: [],
                totalCartPrice: { amount: 0, currency: 'INR' },
            },
        });

        renderWithProvider(<CartPage />);

        await waitFor(() => {
            expect(screen.getByText('Your cart is empty.')).toBeInTheDocument();
        });
        expect(screen.getByText('Go To Shop')).toBeInTheDocument();
    });

    it('should render cart items and calculate price breakdown correctly', async () => {
        const mockProduct = {
            _id: 'prod1',
            title: 'Street Hoodie',
            images: [{ url: '/hoodie.png', alt: 'Street Hoodie' }],
            variants: {
                _id: 'variant1',
                attributes: {
                    size: 'L',
                    color: 'Black'
                },
                stock: 10,
                price: { amount: 100, currency: 'INR' }
            }
        };

        const mockCartItems = [
            {
                _id: 'cart-item-1',
                product: mockProduct,
                variant: 'variant1',
                price: { amount: 100, currency: 'INR' },
                quantity: 2,
            },
        ];

        getCartItems.mockResolvedValueOnce({
            success: true,
            cart: {
                items: mockCartItems,
                totalCartPrice: { amount: 200, currency: 'INR' },
            },
        });

        renderWithProvider(<CartPage />);

        // Verify item details are rendered
        await waitFor(() => {
            expect(screen.getByText('Street Hoodie')).toBeInTheDocument();
        });
        expect(screen.getByText('L')).toBeInTheDocument();
        expect(screen.getByText('Black')).toBeInTheDocument();
        expect(screen.getByText('₹100')).toBeInTheDocument();
        expect(
            screen.getByText('2', { selector: '.cart-quantity-stepper__val' }),
        ).toBeInTheDocument();

        // Subtotal: 100 * 2 = 200
        // Discount: 200 * 0.2 = 40
        // Delivery: 15
        // Total: 200 - 40 + 15 = 175
        expect(screen.getByText('₹200.00')).toBeInTheDocument();
        expect(screen.getByText('-₹40.00')).toBeInTheDocument();
        expect(screen.getByText('₹15.00')).toBeInTheDocument();
        expect(screen.getByText('₹175.00')).toBeInTheDocument();
    });

    it('should increment and decrement quantity and update calculations', async () => {
        const mockProduct = {
            _id: 'prod1',
            title: 'Street Hoodie',
            images: [{ url: '/hoodie.png', alt: 'Street Hoodie' }],
            variants: {
                _id: 'variant1',
                attributes: {
                    size: 'L',
                    color: 'Black'
                },
                stock: 10,
                price: { amount: 100, currency: 'INR' }
            }
        };

        const initialCartItems = [
            {
                _id: 'cart-item-1',
                product: mockProduct,
                variant: 'variant1',
                price: { amount: 100, currency: 'INR' },
                quantity: 1,
            },
        ];

        const incrementedCartItems = [
            {
                _id: 'cart-item-1',
                product: mockProduct,
                variant: 'variant1',
                price: { amount: 100, currency: 'INR' },
                quantity: 2,
            },
        ];

        getCartItems.mockResolvedValueOnce({
            success: true,
            cart: {
                items: initialCartItems,
                totalCartPrice: { amount: 100, currency: 'INR' },
            },
        });

        updateCartItem.mockResolvedValueOnce({
            success: true,
            cart: {
                items: incrementedCartItems,
                totalCartPrice: { amount: 200, currency: 'INR' },
            },
        });

        updateCartItem.mockResolvedValueOnce({
            success: true,
            cart: {
                items: initialCartItems,
                totalCartPrice: { amount: 100, currency: 'INR' },
            },
        });



        renderWithProvider(<CartPage />);

        await waitFor(() => {
            expect(screen.getByText('Street Hoodie')).toBeInTheDocument();
        });

        expect(
            screen.getByText('1', { selector: '.cart-quantity-stepper__val' }),
        ).toBeInTheDocument();
        expect(screen.getByText('₹100.00')).toBeInTheDocument(); // Subtotal

        // Increment
        const incrementBtn = screen.getByLabelText('Increase quantity');
        fireEvent.click(incrementBtn);

        await waitFor(() => {
            expect(
                screen.getByText('2', { selector: '.cart-quantity-stepper__val' }),
            ).toBeInTheDocument();
        });
        expect(screen.getByText('₹200.00')).toBeInTheDocument(); // Subtotal updated

        // Decrement
        const decrementBtn = screen.getByLabelText('Decrease quantity');
        fireEvent.click(decrementBtn);

        await waitFor(() => {
            expect(
                screen.getByText('1', { selector: '.cart-quantity-stepper__val' }),
            ).toBeInTheDocument();
        });
        expect(screen.getByText('₹100.00')).toBeInTheDocument(); // Subtotal updated back
    });

    it('should remove item from cart when delete button is clicked', async () => {
        const mockProduct = {
            _id: 'prod1',
            title: 'Street Hoodie',
            images: [{ url: '/hoodie.png', alt: 'Street Hoodie' }],
            variants: {
                _id: 'variant1',
                attributes: {
                    size: 'L',
                    color: 'Black'
                },
                stock: 10,
                price: { amount: 100, currency: 'INR' }
            }
        };

        const mockCartItems = [
            {
                _id: 'cart-item-1',
                product: mockProduct,
                variant: 'variant1',
                price: { amount: 100, currency: 'INR' },
                quantity: 1,
            },
        ];

        getCartItems.mockResolvedValueOnce({
            success: true,
            cart: {
                items: mockCartItems,
                totalCartPrice: { amount: 100, currency: 'INR' },
            },
        });

        removeFromCart.mockResolvedValueOnce({
            success: true,
            cart: {
                items: [],
                totalCartPrice: { amount: 0, currency: 'INR' },
            },
        });

        renderWithProvider(<CartPage />);

        await waitFor(() => {
            expect(screen.getByText('Street Hoodie')).toBeInTheDocument();
        });

        const deleteBtn = screen.getByLabelText('Remove item');
        fireEvent.click(deleteBtn);

        // Should return to empty state
        await waitFor(() => {
            expect(screen.queryByText('Street Hoodie')).not.toBeInTheDocument();
        });
        expect(screen.getByText('Your cart is empty.')).toBeInTheDocument();
    });
});
