import { createBrowserRouter, Navigate } from 'react-router';
import Register from '../features/auth/pages/Register';
import Login from '../features/auth/pages/Login';
import ForgotPassword from '../features/auth/pages/ForgotPassword';
import ResetPassword from '../features/auth/pages/ResetPassword';
import NotFoundPage from '../features/shared/pages/NotFoundPage';
import ForbiddenPage from '../features/shared/pages/ForbiddenPage';
import ProtectedPage from '../features/auth/components/ProtectedPage';
import UserProfile from '../features/user/pages/UserProfile';
import LandingPage from '../features/landing/pages/LandingPage';
import ProductsPage from '../features/products/pages/ProductsPage';
import ProductDetailsPage from '../features/products/pages/ProductDetailsPage';
import CartPage from '../features/cart/pages/CartPage';
import OrderSummaryPage from '../features/orders/pages/OrderSummaryPage';

export const appRoutes = createBrowserRouter([
    {
        path: '/',
        element: <LandingPage />,
    },
    {
        path: '/products',
        element: <ProductsPage />,
    },
    {
        path: '/products/:productId',
        element: <ProductDetailsPage />,
    },
    {
        path: '/cart',
        element: (
            <ProtectedPage>
                <CartPage />
            </ProtectedPage>
        ),
    },
    {
        path: '/order-summary',
        element: (
            <ProtectedPage>
                <OrderSummaryPage />
            </ProtectedPage>
        ),
    },
    {
        path: '/orders',
        element: (
            <ProtectedPage>
                <Navigate to="/profile?tab=orders" replace />
            </ProtectedPage>
        ),
    },
    {
        path: '/profile',
        element: (
            <ProtectedPage>
                <UserProfile />
            </ProtectedPage>
        ),
    },
    {
        path: '/register',
        element: <Register />,
    },
    {
        path: '/login',
        element: <Login />,
    },
    {
        path: '/forgot-password',
        element: <ForgotPassword />,
    },
    {
        path: '/reset-password',
        element: <ResetPassword />,
    },
    { path: '*', element: <NotFoundPage /> },
    { path: '/forbidden', element: <ForbiddenPage /> },
]);
