import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../../auth/state/auth.slice';
import OrderSummaryPage from './OrderSummaryPage';

describe('OrderSummaryPage Component', () => {
    let store;

    beforeEach(() => {
        window.scrollTo = vi.fn();
        store = configureStore({
            reducer: {
                auth: authReducer,
            },
            preloadedState: {
                auth: { user: { _id: 'user123', fullname: 'Test User' } }
            }
        });
    });

    const renderWithProvider = (ui, initialRoute = '/order-summary', state = null) => {
        return render(
            <Provider store={store}>
                <MemoryRouter initialEntries={[{ pathname: initialRoute, state }]}>
                    {ui}
                </MemoryRouter>
            </Provider>
        );
    };

    it('renders empty/fallback state when state is missing', () => {
        renderWithProvider(<OrderSummaryPage />, '/order-summary', null);

        expect(screen.getByText('No Recent Order Found')).toBeInTheDocument();
        expect(screen.getByText('View Order History')).toBeInTheDocument();
    });

    it('renders placed orders list, total paid price, and success message', () => {
        const mockProduct = {
            _id: 'p1',
            title: 'Streetwear Cap',
            variants: [
                {
                    _id: 'v1',
                    attributes: { Size: 'One Size', Color: 'Black' },
                    images: [{ url: '/cap.png', thumbnailUrl: '/cap.png', alt: 'Cap' }]
                }
            ]
        };

        const mockOrders = [
            {
                _id: 'orderA',
                status: 'paid',
                totalPrice: { amount: 999, currency: 'INR' },
                items: [
                    {
                        product: mockProduct,
                        variant: 'v1',
                        quantity: 2,
                        price: { amount: 999, currency: 'INR' }
                    }
                ]
            }
        ];

        const mockPayment = {
            razorpay: { paymentId: 'pay_12345' }
        };

        renderWithProvider(
            <OrderSummaryPage />,
            '/order-summary',
            { orders: mockOrders, paymentOrder: mockPayment }
        );

        expect(screen.getByText('Order Placed Successfully!')).toBeInTheDocument();
        expect(screen.getByText('pay_12345')).toBeInTheDocument();
        expect(screen.getByText('Streetwear Cap')).toBeInTheDocument();
        expect(screen.getByText('Size: One Size')).toBeInTheDocument();
        expect(screen.getByText('Color: Black')).toBeInTheDocument();
        expect(screen.getByText('Qty: 2')).toBeInTheDocument();
        expect(screen.getAllByText('₹999')).toHaveLength(3); // Item price + Order total + Payment total
    });
});
