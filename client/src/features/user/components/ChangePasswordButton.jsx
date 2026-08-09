import React, { useState } from 'react';
import AuthFormGroup from '../../auth/components/AuthFormGroup';

//TODO: Implement the change password functionality and move this component to the auth feature.

const ChangePasswordButton = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [passwords, setPasswords] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });

    const handleToggle = () => {
        setIsOpen((prev) => !prev);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setPasswords((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
    };

    return (
        <div className="change-password-section">
            <button
                type="button"
                className="button secondary-button change-password-trigger"
                onClick={handleToggle}
            >
                {isOpen ? 'Cancel Change' : 'Change Password'}
            </button>

            {isOpen && (
                <form
                    className="change-password-form"
                    onSubmit={handleSubmit}
                >
                    <h3 className="change-password-form__title">
                        Update Password
                    </h3>
                    <AuthFormGroup
                        label="Current Password"
                        id="currentPassword"
                        type="password"
                        name="currentPassword"
                        value={passwords.currentPassword}
                        onChange={handleChange}
                        placeholder="Enter current password"
                    />
                    <AuthFormGroup
                        label="New Password"
                        id="newPassword"
                        type="password"
                        name="newPassword"
                        value={passwords.newPassword}
                        onChange={handleChange}
                        placeholder="Enter new password"
                    />
                    <AuthFormGroup
                        label="Confirm New Password"
                        id="confirmPassword"
                        type="password"
                        name="confirmPassword"
                        value={passwords.confirmPassword}
                        onChange={handleChange}
                        placeholder="Confirm new password"
                    />
                    <button
                        type="submit"
                        className="button primary-button change-password-submit"
                    >
                        Update Password
                    </button>
                </form>
            )}
        </div>
    );
};

export default ChangePasswordButton;
