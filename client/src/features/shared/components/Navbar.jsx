import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router';
import { useSelector } from 'react-redux';
import LogoutButton from '../../auth/components/LogoutButton';
import { useCart } from '../../cart/hooks/useCart';

const Navbar = () => {
    const { user } = useSelector((state) => state.auth);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [searchVal, setSearchVal] = useState('');
    const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
    const navigate = useNavigate();

    const { handleFetchCartCount } = useCart();
    const cartCount = useSelector((state) => state.cart?.cartCount || 0);

    useEffect(() => {
        if (user) {
            handleFetchCartCount();
        }
    }, [user]);

    useEffect(() => {
        if (isDrawerOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isDrawerOpen]);

    const closeAllMenus = () => {
        setIsDrawerOpen(false);
        setIsDropdownOpen(false);
        setIsMobileSearchOpen(false);
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        if (searchVal.trim()) {
            navigate(
                `/products?search=${encodeURIComponent(searchVal.trim())}`,
            );
            closeAllMenus();
        }
    };

    // Clothes-only categories
    const categories = [
        { name: 'Discover', path: '/products' },
        { name: 'Shirts', path: '/products?category=Shirts' },
        { name: 'T-shirts', path: '/products?category=T-Shirts' },
        { name: 'Jeans', path: '/products?category=Jeans' },
        { name: 'Hoodies', path: '/products?category=Hoodies' },
        { name: 'Blazers', path: '/products?category=Blazers' },
        { name: 'Casual', path: '/products?category=Casual' },
        { name: 'Formal', path: '/products?category=Formal' },
        { name: 'Gym', path: '/products?category=Gym' },
        { name: 'Party', path: '/products?category=Party' },
    ];

    return (
        <>
            <nav className="navbar">
                {/* Top Header Row */}
                <div className="navbar__top-row">
                    {isMobileSearchOpen ? (
                        <form
                            className="navbar__mobile-search-form"
                            onSubmit={handleSearchSubmit}
                        >
                            <button
                                type="button"
                                className="navbar__mobile-search-close"
                                onClick={() => setIsMobileSearchOpen(false)}
                                aria-label="Close search bar"
                            >
                                <i className="ri-arrow-left-line"></i>
                            </button>
                            <div className="navbar__mobile-search-input-wrap">
                                <i className="ri-search-line navbar__search-icon"></i>
                                <input
                                    type="text"
                                    placeholder='Search "STRAIGHT FIT JEANS"'
                                    className="navbar__search-field"
                                    value={searchVal}
                                    onChange={(e) =>
                                        setSearchVal(e.target.value)
                                    }
                                    autoFocus
                                />
                            </div>
                        </form>
                    ) : (
                        <>
                            {/* Left: Hamburger menu toggle */}
                            <button
                                className="navbar__toggle-btn"
                                onClick={() => setIsDrawerOpen(true)}
                                aria-label="Open categories menu"
                            >
                                <i className="ri-menu-line"></i>
                            </button>

                            {/* Center: Logo Sciolto */}
                            <Link
                                to="/"
                                className="navbar__logo-link"
                                onClick={closeAllMenus}
                            >
                                Sciolto
                            </Link>

                            {/* Right Actions */}
                            <div className="navbar__right-actions">
                                {/* Mobile Search Toggle Trigger */}
                                <button
                                    className="navbar__icon-link navbar__search-toggle-mobile"
                                    onClick={() => setIsMobileSearchOpen(true)}
                                    aria-label="Open search bar"
                                >
                                    <i className="ri-search-line"></i>
                                </button>

                                {/* Search Input Box (Desktop) */}
                                <form
                                    className="navbar__search-box"
                                    onSubmit={handleSearchSubmit}
                                >
                                    <i className="ri-search-line navbar__search-icon"></i>
                                    <input
                                        type="text"
                                        placeholder='Search "STRAIGHT FIT JEANS"'
                                        className="navbar__search-field"
                                        value={searchVal}
                                        onChange={(e) =>
                                            setSearchVal(e.target.value)
                                        }
                                    />
                                </form>

                                {/* Profile Shortcut / Dropdown */}
                                {user ? (
                                    <div className="navbar__user-menu">
                                        <button
                                            className="navbar__icon-link navbar__profile-trigger"
                                            onClick={() =>
                                                setIsDropdownOpen(
                                                    !isDropdownOpen,
                                                )
                                            }
                                            aria-expanded={isDropdownOpen}
                                            aria-label="User profile options"
                                        >
                                            <i className="ri-user-line"></i>
                                            <span className="navbar__user-badge-name">
                                                {user.fullname.split(' ')[0]}
                                            </span>
                                        </button>
                                        {isDropdownOpen && (
                                            <div className="navbar__profile-dropdown-list">
                                                <Link
                                                    to="/profile"
                                                    className="navbar__dropdown-link-item"
                                                    onClick={closeAllMenus}
                                                >
                                                    Profile
                                                </Link>
                                                {user.role === 'seller' && (
                                                    <Link
                                                        to="/profile?tab=my-products"
                                                        className="navbar__dropdown-link-item"
                                                        onClick={closeAllMenus}
                                                    >
                                                        My Products
                                                    </Link>
                                                )}
                                                <LogoutButton
                                                    className="navbar__dropdown-link-item navbar__dropdown-link-item--logout"
                                                    onClick={closeAllMenus}
                                                />
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <Link
                                        to="/login?redirect=/profile"
                                        className="navbar__icon-link"
                                        onClick={closeAllMenus}
                                        aria-label="Sign in"
                                    >
                                        <i className="ri-user-line"></i>
                                    </Link>
                                )}

                                {/* Cart Icon */}
                                <Link
                                    to="/cart"
                                    className="navbar__icon-link navbar__cart-shortcut"
                                    onClick={closeAllMenus}
                                    aria-label="Shopping Cart"
                                >
                                    <i className="ri-shopping-bag-line"></i>
                                    {cartCount > 0 && (
                                        <span className="navbar__cart-indicator-badge">
                                            {cartCount}
                                        </span>
                                    )}
                                </Link>
                            </div>
                        </>
                    )}
                </div>
            </nav>

            {/* Slide Drawer Category Menu (Left-sliding) */}
            {isDrawerOpen && (
                <div className="drawer-overlay">
                    <div
                        className="drawer-overlay__backdrop"
                        onClick={closeAllMenus}
                    ></div>

                    <div className="drawer-overlay__drawer-panel">
                        {/* Header */}
                        <div className="drawer-overlay__header-row">
                            <button
                                className="drawer-overlay__close-trigger"
                                onClick={closeAllMenus}
                                aria-label="Close categories menu"
                            >
                                <i className="ri-close-line"></i>
                            </button>
                            <span className="drawer-overlay__header-title">
                                CATEGORIES
                            </span>
                        </div>

                        {/* Scrollable Content */}
                        <div className="drawer-overlay__scroll-body">
                            {/* Horizontal Promotional Scroll */}
                            <div className="drawer-overlay__promo-row">
                                <div className="drawer-overlay__promo-tile">
                                    <span className="drawer-overlay__promo-tag">
                                        FLAT 60% OFF
                                    </span>
                                    <span className="drawer-overlay__promo-sub">
                                        B'DAY SALE
                                    </span>
                                </div>
                                <div className="drawer-overlay__promo-tile">
                                    <span className="drawer-overlay__promo-tag">
                                        NEW IN
                                    </span>
                                    <span className="drawer-overlay__promo-sub">
                                        LINEN EDIT
                                    </span>
                                </div>
                                <div className="drawer-overlay__promo-tile">
                                    <span className="drawer-overlay__promo-tag">
                                        BESTSELLERS
                                    </span>
                                    <span className="drawer-overlay__promo-sub">
                                        TRENDING NOW
                                    </span>
                                </div>
                                <div className="drawer-overlay__promo-tile">
                                    <span className="drawer-overlay__promo-tag">
                                        SUMMER CAPSULE
                                    </span>
                                    <span className="drawer-overlay__promo-sub">
                                        LIGHTWEIGHTS
                                    </span>
                                </div>
                            </div>

                            {/* Nav Curation Lists */}
                            <Link
                                to="/products?sort=newest"
                                className="drawer-overlay__menu-link"
                                onClick={closeAllMenus}
                            >
                                NEW ARRIVALS
                            </Link>
                            <Link
                                to="/products?sort=popular"
                                className="drawer-overlay__menu-link"
                                onClick={closeAllMenus}
                            >
                                BESTSELLERS
                            </Link>
                            <Link
                                to="/products"
                                className="drawer-overlay__menu-link"
                                onClick={closeAllMenus}
                            >
                                SHOP ALL
                            </Link>

                            {/* Separator Title */}
                            <div className="drawer-overlay__category-section-title">
                                CLOTHING CATEGORIES
                            </div>

                            {categories.slice(1).map((cat) => (
                                <Link
                                    key={cat.name}
                                    to={cat.path}
                                    className="drawer-overlay__menu-link drawer-overlay__menu-link--category"
                                    onClick={closeAllMenus}
                                >
                                    <span>{cat.name.toUpperCase()}</span>
                                    <i className="ri-arrow-right-s-line"></i>
                                </Link>
                            ))}

                            {user && (
                                <div style={{ marginTop: '32px' }}>
                                    <LogoutButton
                                        className="drawer-overlay__logout-action"
                                        onClick={closeAllMenus}
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default Navbar;
