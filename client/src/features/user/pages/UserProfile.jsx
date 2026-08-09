import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { useSearchParams } from 'react-router';
import Navbar from '../../shared/components/Navbar';
import DashboardHome from '../components/DashboardHome';
import DashboardAccount from '../components/DashboardAccount';
import DashboardAddresses from '../components/DashboardAddresses';
import OrdersPage from '../../orders/pages/OrdersPage';
import DashboardMyProducts from '../../products/components/product-dashboard/DashboardMyProducts';
import CreateProduct from '../../products/pages/product-dashboard/CreateProduct';
import EditProduct from '../../products/pages/product-dashboard/EditProduct';
import CreateVariant from '../../products/components/product-dashboard/CreateVariant';
import '../styles/_user.scss';

const mockProducts = [
    {
        price: {
            amount: 399,
            currency: 'INR',
        },
        _id: '69ff67aeaee39489f36b8f79',
        title: 'Printed Tshirt',
        description: 'Best Printed Tshirts you can buy',
        seller: {
            _id: '69ff08a5b23b53a45c4f6510',
            email: 'skyh53624@gmail.com',
            contact: '1231231231',
            fullname: 'Test User',
            role: 'seller',
            __v: 0,
        },
        images: [
            {
                url: 'https://ik.imagekit.io/ji8wynr3i/snitch/products/69ff08a5b23b53a45c4f6510/printed-tshirts_dG7ew32xq.png',
                thumbnailUrl:
                    'https://ik.imagekit.io/ji8wynr3i/tr:n-ik_ml_thumbnail/snitch/products/69ff08a5b23b53a45c4f6510/printed-tshirts_dG7ew32xq.png',
                alt: 'Printed Tshirt',
                _id: '69ff67aeaee39489f36b8f7a',
            },
            {
                url: 'https://ik.imagekit.io/ji8wynr3i/snitch/products/69ff08a5b23b53a45c4f6510/printed-tshirts1_zZ4QSMtVa.png',
                thumbnailUrl:
                    'https://ik.imagekit.io/ji8wynr3i/tr:n-ik_ml_thumbnail/snitch/products/69ff08a5b23b53a45c4f6510/printed-tshirts1_zZ4QSMtVa.png',
                alt: 'Printed Tshirt',
                _id: '69ff67aeaee39489f36b8f7b',
            },
        ],
        createdAt: '2026-05-09T16:58:22.170Z',
        updatedAt: '2026-05-09T16:58:22.170Z',
        __v: 0,
    },
];

//FIXME: When change the tab form the my products to add a product , the add products is activating a scrollbar , Which cause a layout shift in whole page including the navbar.

const UserProfile = () => {
    const { user } = useSelector((state) => state.auth);
    const [searchParams, setSearchParams] = useSearchParams();

    // Provide default fallback values for development/testing if user is empty
    const displayUser = user || {
        fullname: 'Test User',
        email: 'skyh53624@gmail.com',
        contact: '1231231231',
        role: 'seller',
    };

    // Derive active tab from search parameter (Vercel best practice: no useEffect)
    const rawTab = searchParams.get('tab') || 'home';
    const activeTab = rawTab === 'my-products' ? 'products' : rawTab;
    const productId = searchParams.get('productId');
    const isProductTab = ['products', 'add-product', 'edit-product', 'add-variant'].includes(
        activeTab,
    );

    const handleTabChange = (newTab) => {
        setSearchParams({ tab: newTab });
    };

    return (
        <div className="user-profile-page">
            <Navbar />

            <main className="user-profile-main" id="main-content">
                <div className="user-profile-container">
                    <div className="profile-dashboard">
                        {/* ── Level 1: Parent Sidebar ── */}
                        <aside className={`dashboard-sidebar`}>
                            <div>
                                <nav className="dashboard-sidebar__nav">
                                    <button
                                        type="button"
                                        className={`dashboard-sidebar__item ${activeTab === 'home' ? 'dashboard-sidebar__item--active' : ''}`}
                                        onClick={() => handleTabChange('home')}
                                        title="Home"
                                    >
                                        <i className="ri-home-3-line"></i>
                                        <span>Home</span>
                                    </button>
                                    <button
                                        type="button"
                                        className={`dashboard-sidebar__item ${activeTab === 'account' ? 'dashboard-sidebar__item--active' : ''}`}
                                        onClick={() => handleTabChange('account')}
                                        title="Account"
                                    >
                                        <i className="ri-user-line"></i>
                                        <span>Account</span>
                                    </button>
                                    <button
                                        type="button"
                                        className={`dashboard-sidebar__item ${activeTab === 'addresses' ? 'dashboard-sidebar__item--active' : ''}`}
                                        onClick={() => handleTabChange('addresses')}
                                        title="Addresses"
                                    >
                                        <i className="ri-map-pin-line"></i>
                                        <span>Addresses</span>
                                    </button>
                                    <button
                                        type="button"
                                        className={`dashboard-sidebar__item ${activeTab === 'orders' ? 'dashboard-sidebar__item--active' : ''}`}
                                        onClick={() => handleTabChange('orders')}
                                        title="Orders"
                                    >
                                        <i className="ri-file-list-3-line"></i>
                                        <span>Orders</span>
                                    </button>

                                    {displayUser.role === 'seller' ? (
                                        <button
                                            type="button"
                                            className={`dashboard-sidebar__item ${isProductTab ? 'dashboard-sidebar__item--active' : ''}`}
                                            onClick={() => handleTabChange('products')}
                                            title="Products"
                                        >
                                            <i className="ri-shopping-bag-line"></i>
                                            <span>Products</span>
                                        </button>
                                    ) : null}
                                </nav>
                            </div>
                        </aside>

                        {/* ── Main Content Area ── */}
                        <section className="profile-dashboard__main-content">
                            {activeTab === 'home' ? (
                                <DashboardHome displayUser={displayUser} />
                            ) : null}

                            {activeTab === 'account' ? (
                                <DashboardAccount displayUser={displayUser} />
                            ) : null}

                            {activeTab === 'addresses' ? <DashboardAddresses /> : null}

                            {activeTab === 'orders' ? <OrdersPage /> : null}

                            {activeTab === 'products' ? (
                                <DashboardMyProducts
                                    mockProducts={mockProducts}
                                    onAddNewProduct={() => handleTabChange('add-product')}
                                    onEditProduct={(id) =>
                                        setSearchParams({ tab: 'edit-product', productId: id })
                                    }
                                    onAddVariant={(id) =>
                                        setSearchParams({ tab: 'add-variant', productId: id })
                                    }
                                />
                            ) : null}

                            {activeTab === 'add-product' ? (
                                <div className="dashboard-add-product">
                                    <h1 className="dashboard-title">List New Product</h1>
                                    <CreateProduct
                                        isEmbedded={true}
                                        onCancel={() => handleTabChange('products')}
                                        onSuccess={() => handleTabChange('products')}
                                    />
                                </div>
                            ) : null}

                            {activeTab === 'edit-product' ? (
                                <div className="dashboard-edit-product">
                                    <h1 className="dashboard-title">Product Details</h1>
                                    <EditProduct
                                        productId={productId}
                                        onCancel={() => handleTabChange('products')}
                                        onSuccess={() => handleTabChange('products')}
                                        onAddVariant={() =>
                                            setSearchParams({ tab: 'add-variant', productId })
                                        }
                                    />
                                </div>
                            ) : null}

                            {activeTab === 'add-variant' ? (
                                <div className="dashboard-add-variant">
                                    <h1 className="dashboard-title">Create Product Variant</h1>
                                    <CreateVariant
                                        productId={productId}
                                        onCancel={() =>
                                            setSearchParams({ tab: 'edit-product', productId })
                                        }
                                        onSuccess={() =>
                                            setSearchParams({ tab: 'edit-product', productId })
                                        }
                                    />
                                </div>
                            ) : null}
                        </section>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default UserProfile;
