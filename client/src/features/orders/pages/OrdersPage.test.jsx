import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import orderReducer from '../state/order.slice';
import authReducer from '../../auth/state/auth.slice';
import OrdersPage from './OrdersPage';
import { getUserOrders } from '../service/order.api';

vi.mock('../service/order.api');

describe('OrdersPage Component', () => {
    let store;

    beforeEach(() => {
        vi.clearAllMocks();
        store = configureStore({
            reducer: {
                order: orderReducer,
                auth: authReducer,
            },
            preloadedState: {
                order: { orders: [], loading: false, error: null },
                auth: { user: { _id: 'user123', fullname: 'Test User' } }
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

    it('renders empty state when user has no orders', async () => {
        getUserOrders.mockResolvedValueOnce({
            success: true,
            orders: [],
        });

        renderWithProvider(<OrdersPage />);

        await waitFor(() => {
            expect(screen.getByText("You haven't placed any orders yet.")).toBeInTheDocument();
        });
        expect(screen.getByText('START SHOPPING')).toBeInTheDocument();
    });

    it('renders orders list correctly with status and total price formatted in ₹', async () => {
        const mockProduct = {
            _id: 'prod123',
            title: 'Streetwear T-Shirt',
            variants: [
                {
                    _id: 'variant123',
                    attributes: { size: 'M', color: 'White' },
                    images: [{ thumbnailUrl: '/tshirt.png', url: '/tshirt.png', alt: 'T-Shirt' }]
                }
            ]
        };

        const mockOrders = [
            {
                _id: 'order123',
                createdAt: '2026-08-10T00:00:00.000Z',
                status: 'paid',
                totalPrice: { amount: 1599, currency: 'INR' },
                items: [
                    {
                        product: mockProduct,
                        variant: 'variant123',
                        quantity: 1,
                        price: { amount: 1599, currency: 'INR' }
                    }
                ]
            }
        ];

        getUserOrders.mockResolvedValueOnce({
            success: true,
            orders: mockOrders,
        });

        renderWithProvider(<OrdersPage />);

        await waitFor(() => {
            expect(screen.getByText('Streetwear T-Shirt')).toBeInTheDocument();
        });

        expect(screen.getByText('PAID')).toBeInTheDocument();
        expect(screen.getAllByText('₹1599')).toHaveLength(2);
        expect(screen.getByText('Size: M')).toBeInTheDocument();
        expect(screen.getByText('Color: White')).toBeInTheDocument();
        expect(screen.getByText('Qty: 1')).toBeInTheDocument();
    });
});
