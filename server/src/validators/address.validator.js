import { body, validationResult } from 'express-validator';

function validateRequest(req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
}

export const validateAddress = [
    body('name')
        .isString()
        .isLength({ min: 3 })
        .withMessage('Name must be at least 3 characters long'),
    body('contact')
        .matches(/^[6-9]\d{9}$/)
        .withMessage('Please provide a valid 10-digit mobile number'),
    body('addressLine1')
        .notEmpty()
        .withMessage('Address Line 1 is required'),
    body('addressLine2')
        .optional()
        .isString(),
    body('city')
        .notEmpty()
        .withMessage('City is required'),
    body('state')
        .notEmpty()
        .withMessage('State is required'),
    body('country')
        .optional()
        .isString()
        .withMessage('Country must be a string'),
    body('pincode')
        .matches(/^\d{6}$/)
        .withMessage('Pincode must be exactly 6 digits'),

    validateRequest,
];
