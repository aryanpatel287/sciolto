import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useSearchParams, useNavigate } from 'react-router';
import { useAddress } from '../hooks/useAddress';
import AddressForm from './AddressForm';

const DashboardAddresses = () => {
    const { addresses, loading, error } = useSelector((state) => state.address);
    const { handleFetchAddresses, handleCreateAddress, handleUpdateAddress, handleDeleteAddress } = useAddress();
    const [view, setView] = useState('list'); // 'list' | 'add' | 'edit'
    const [editingAddress, setEditingAddress] = useState(null);
    
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();
    
    const action = searchParams.get('action');
    const addressIdParam = searchParams.get('addressId');
    const redirectUrl = searchParams.get('redirect');

    useEffect(() => {
        handleFetchAddresses();
    }, []);

    // Set view and editing address based on URL search params
    useEffect(() => {
        if (addresses && addresses.length > 0) {
            if (action === 'edit' && addressIdParam) {
                const found = addresses.find((addr) => addr._id === addressIdParam);
                if (found) {
                    setEditingAddress(found);
                    setView('edit');
                    return;
                }
            }
        }
        
        if (action === 'add') {
            setView('add');
            setEditingAddress(null);
        } else {
            setView('list');
            setEditingAddress(null);
        }
    }, [action, addressIdParam, addresses]);

    const handleFormSubmit = async (data) => {
        try {
            let result;
            if (view === 'add') {
                result = await handleCreateAddress(data);
            } else if (view === 'edit' && editingAddress) {
                result = await handleUpdateAddress(editingAddress._id, data);
            }
            
            if (redirectUrl) {
                const selectId = result ? result._id : '';
                navigate(`${redirectUrl}?selectAddressId=${selectId}`);
            } else {
                setSearchParams({ tab: 'addresses' });
                setView('list');
                setEditingAddress(null);
            }
        } catch (err) {
            console.error('Submit address failed:', err);
        }
    };

    const handleCancel = () => {
        if (redirectUrl) {
            navigate(redirectUrl);
        } else {
            setSearchParams({ tab: 'addresses' });
            setView('list');
            setEditingAddress(null);
        }
    };

    return (
        <div className="dashboard-addresses">
            <div className="dashboard-header-row">
                <h1 className="dashboard-title">My Addresses</h1>
                {view === 'list' && (
                    <button
                        onClick={() => setSearchParams({ tab: 'addresses', action: 'add' })}
                        className="button primary-button add-address-btn"
                    >
                        Add New Address
                    </button>
                )}
            </div>

            {error && <div className="error-alert">{error}</div>}

            {view === 'list' ? (
                loading ? (
                    <div className="loading-state">Loading addresses...</div>
                ) : !addresses || addresses.length === 0 ? (
                    <div className="empty-state">No saved addresses found. Add one to speed up checkout.</div>
                ) : (
                    <div className="addresses-grid">
                        {addresses.map((address) => (
                            <div key={address._id} className="address-card">
                                <h3 className="address-card__name">{address.name}</h3>
                                <p className="address-card__contact">Phone: {address.contact}</p>
                                <p className="address-card__line">{address.addressLine1}</p>
                                {address.addressLine2 && <p className="address-card__line">{address.addressLine2}</p>}
                                <p className="address-card__city-pin">
                                    {address.city}, {address.state} - {address.pincode}
                                </p>
                                <p className="address-card__country">{address.country}</p>
                                <div className="address-card__actions">
                                    <button
                                        onClick={() => {
                                            setSearchParams({
                                                tab: 'addresses',
                                                action: 'edit',
                                                addressId: address._id
                                            });
                                        }}
                                        className="address-action-btn edit-btn"
                                    >
                                        <i className="ri-pencil-line"></i> Edit
                                    </button>
                                    <button
                                        onClick={() => handleDeleteAddress(address._id)}
                                        className="address-action-btn delete-btn"
                                    >
                                        <i className="ri-delete-bin-line"></i> Delete
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )
            ) : (
                <div className="form-container-card">
                    <AddressForm
                        initialData={editingAddress}
                        onSubmit={handleFormSubmit}
                        onCancel={handleCancel}
                        loading={loading}
                    />
                </div>
            )}
        </div>
    );
};

export default DashboardAddresses;
