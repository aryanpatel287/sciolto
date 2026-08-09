import React from 'react';
import '../styles/_address-modal.scss';

const AddressSelectModal = ({
    isOpen,
    onClose,
    addresses,
    selectedAddressId,
    onSelect,
    onAddNew,
    onEdit,
}) => {
    if (!isOpen) return null;

    return (
        <div className="address-modal-overlay" onClick={onClose}>
            <div className="address-modal-container" onClick={(e) => e.stopPropagation()}>
                <div className="address-modal-header">
                    <h2 className="address-modal-title">SELECT DELIVERY ADDRESS</h2>
                    <button type="button" className="close-btn" onClick={onClose} aria-label="Close">
                        <i className="ri-close-line"></i>
                    </button>
                </div>

                <div className="address-modal-body">
                    <div className="saved-addresses-header">
                        <span className="subtitle">Saved Addresses</span>
                        <button type="button" className="add-new-link" onClick={onAddNew}>
                            + ADD NEW
                        </button>
                    </div>

                    <div className="address-list">
                        {!addresses || addresses.length === 0 ? (
                            <p className="no-addresses-text">No saved addresses found. Click "+ ADD NEW" to add one.</p>
                        ) : (
                            addresses.map((address) => (
                                <div
                                    key={address._id}
                                    className={`address-option-card ${
                                        selectedAddressId === address._id ? 'selected' : ''
                                    }`}
                                    onClick={() => onSelect(address._id)}
                                >
                                    <div className="option-left">
                                        <input
                                            type="radio"
                                            name="selectedAddress"
                                            checked={selectedAddressId === address._id}
                                            onChange={() => onSelect(address._id)}
                                        />
                                    </div>
                                    <div className="option-center">
                                        <h4 className="recipient-name">{address.name}</h4>
                                        <p className="address-text">
                                            {address.addressLine1}
                                            {address.addressLine2 ? `, ${address.addressLine2}` : ''}
                                            <br />
                                            {address.city}, {address.state} - {address.pincode}
                                        </p>
                                        <p className="phone-text">Phone Number - {address.contact}</p>
                                    </div>
                                    <div className="option-right">
                                        <button
                                            type="button"
                                            className="edit-link"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onEdit(address._id);
                                            }}
                                        >
                                            EDIT
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                <div className="address-modal-footer">
                    <button type="button" className="confirm-btn" onClick={onClose}>
                        CONFIRM ADDRESS
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AddressSelectModal;
