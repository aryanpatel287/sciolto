import React, { useState } from 'react';

const AddressForm = ({ initialData, onSubmit, onCancel, loading }) => {
    const [formData, setFormData] = useState(initialData || {
        name: '',
        contact: '',
        addressLine1: '',
        addressLine2: '',
        city: '',
        state: '',
        pincode: '',
        country: 'India',
    });
    const [errors, setErrors] = useState({});

    const validate = () => {
        const temp = {};
        if (!formData.name || formData.name.trim().length < 3) temp.name = "Name must be min 3 chars";
        if (!/^[6-9]\d{9}$/.test(formData.contact)) temp.contact = "Must be valid 10-digit mobile number";
        if (!formData.addressLine1 || !formData.addressLine1.trim()) temp.addressLine1 = "Address line 1 is required";
        if (!formData.city || !formData.city.trim()) temp.city = "City is required";
        if (!formData.state || !formData.state.trim()) temp.state = "State is required";
        if (!/^\d{6}$/.test(formData.pincode)) temp.pincode = "Must be 6-digit pin code";
        setErrors(temp);
        return Object.keys(temp).length === 0;
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (validate()) {
            onSubmit(formData);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="address-form">
            <h3 className="form-title">{initialData ? 'Edit Address' : 'New Address'}</h3>
            <div className="form-row">
                <div className="form-group">
                    <label>Recipient Name *</label>
                    <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className={errors.name ? 'error' : ''}
                    />
                    {errors.name && <span className="error-text">{errors.name}</span>}
                </div>
                <div className="form-group">
                    <label>Contact Number *</label>
                    <input
                        type="text"
                        name="contact"
                        value={formData.contact}
                        onChange={handleChange}
                        className={errors.contact ? 'error' : ''}
                    />
                    {errors.contact && <span className="error-text">{errors.contact}</span>}
                </div>
            </div>
            <div className="form-group">
                <label>Address Line 1 *</label>
                <input
                    type="text"
                    name="addressLine1"
                    value={formData.addressLine1}
                    onChange={handleChange}
                    className={errors.addressLine1 ? 'error' : ''}
                />
                {errors.addressLine1 && <span className="error-text">{errors.addressLine1}</span>}
            </div>
            <div className="form-group">
                <label>Address Line 2 (Optional)</label>
                <input
                    type="text"
                    name="addressLine2"
                    value={formData.addressLine2 || ''}
                    onChange={handleChange}
                />
            </div>
            <div className="form-row">
                <div className="form-group">
                    <label>City *</label>
                    <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        className={errors.city ? 'error' : ''}
                    />
                    {errors.city && <span className="error-text">{errors.city}</span>}
                </div>
                <div className="form-group">
                    <label>State *</label>
                    <input
                        type="text"
                        name="state"
                        value={formData.state}
                        onChange={handleChange}
                        className={errors.state ? 'error' : ''}
                    />
                    {errors.state && <span className="error-text">{errors.state}</span>}
                </div>
            </div>
            <div className="form-row">
                <div className="form-group">
                    <label>Pincode *</label>
                    <input
                        type="text"
                        name="pincode"
                        value={formData.pincode}
                        onChange={handleChange}
                        className={errors.pincode ? 'error' : ''}
                    />
                    {errors.pincode && <span className="error-text">{errors.pincode}</span>}
                </div>
                <div className="form-group">
                    <label>Country</label>
                    <input
                        type="text"
                        name="country"
                        value={formData.country}
                        disabled
                    />
                </div>
            </div>
            <div className="form-actions">
                <button type="submit" disabled={loading} className="button primary-button">
                    Save Address
                </button>
                <button type="button" onClick={onCancel} className="button secondary-button">
                    Cancel
                </button>
            </div>
        </form>
    );
};

export default AddressForm;
