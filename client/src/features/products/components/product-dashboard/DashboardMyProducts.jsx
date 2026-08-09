import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useProduct } from '../../hooks/useProduct';
import { EditorialProductCard } from '../EditorialProductCard';

const DashboardMyProducts = ({
    mockProducts,
    onAddNewProduct,
    onEditProduct,
    onAddVariant,
}) => {
    const { sellerProducts, loading } = useSelector((state) => state.product);

    const { handleGetProducts } = useProduct();

    useEffect(() => {
        handleGetProducts();
    }, []);

    if (loading) return <div className="dashboard-loading">Loading...</div>;

    if (!loading && !sellerProducts) {
        return <div className="dashboard-error">Something went wrong.</div>;
    }

    return (
        <div className="dashboard-my-products">
            <div className="dashboard-header-with-actions">
                <div>
                    <h1 className="dashboard-title">My Catalog</h1>
                </div>
                <button
                    type="button"
                    className="button primary-button dashboard-header-btn"
                    onClick={onAddNewProduct}
                >
                    Add New Product
                </button>
            </div>

            {sellerProducts.length === 0 ? (
                <div className="dashboard-empty">No products found.</div>
            ) : (
                <div className="products-grid">
                    {sellerProducts.map((product) => (
                        <div
                            key={product._id}
                            className="dashboard-product-card-wrapper"
                            onClick={() => onEditProduct(product._id)}
                            style={{ cursor: 'pointer' }}
                        >
                            <EditorialProductCard product={product} />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default DashboardMyProducts;
