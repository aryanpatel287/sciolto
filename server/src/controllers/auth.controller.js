import redis from '../config/cache.js';
import { config } from '../config/config.js';
import {
    findUserByEmailOrContact,
    createUser,
    findUserByEmailWithPassword,
    findUserByEmail,
    updateUserPassword,
    getCachedUser,
    invalidateUserCache,
} from '../dao/user.dao.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { sendResponse } from '../utils/response.utlis.js';
import { sendEmail } from '../services/mail/mail.service.js';
import { resetPasswordEmailTemplate } from '../utils/emailTemplates.utils.js';

/**
 * @description Send token response after successful registration or login
 */
async function sendTokenResponse({ user, message, isRegister }, res) {
    const token = jwt.sign(
        {
            _id: user._id,
            role: user.role,
        },
        config.JWT_SECRET,
        { expiresIn: '7d' },
    );

    res.cookie('token', token);

    await sendResponse({
        res,
        statusCode: isRegister ? 201 : 200,
        message,
        success: true,
        user: {
            _id: user._id,
            email: user.email,
            contact: user.contact,
            fullname: user.fullname,
            role: user.role,
        },
    });
}

/**
 * @description Check if token already exists in cookies
 * @access Private
 * @body No body required
 */
async function checkTokenExists(req, res) {
    const token = req.cookies?.token;

    if (!token) {
        return false;
    }
    await sendResponse({
        res,
        statusCode: 200,
        message: 'User already logged in',
        success: true,
    });
    return true;
}

/**
 * @route POST /api/auth/register
 * @description Register a new user
 * @access Public
 * @body { email, password, contact, fullname }
 */
async function RegsiterUserController(req, res) {
    try {
        const tokenExists = await checkTokenExists(req, res);
        if (tokenExists) {
            return;
        }

        const { email, password, contact, fullname, isSeller } = req.body;
        const isUserExists = await findUserByEmailOrContact(email, contact);

        if (isUserExists) {
            return await sendResponse({
                res,
                statusCode: 409,
                message: 'User already exists',
                success: false,
            });
        }

        const user = await createUser({
            email,
            password,
            contact,
            fullname,
            role: isSeller ? 'seller' : 'buyer',
        });

        return await sendTokenResponse(
            { user, message: 'User registered successfully', isRegister: true },
            res,
        );
    } catch (error) {
        console.log(error);

        return await sendResponse({
            res,
            statusCode: 500,
            message: 'Server error',
            success: false,
        });
    }
}

/**
 * @route POST /api/auth/login
 * @description Login user and return token
 * @access Public
 * @body { email, password }
 */
async function loginUserController(req, res) {
    try {
        const tokenExists = await checkTokenExists(req, res);
        if (tokenExists) {
            return;
        }

        const { email, password } = req.body;

        const user = await findUserByEmailWithPassword(email);

        if (!user || !user.password) {
            return await sendResponse({
                res,
                statusCode: 401,
                message: 'Invalid credentials',
                success: false,
            });
        }

        const isPasswordMatch = await user.comparePassword(password);

        if (!isPasswordMatch) {
            return await sendResponse({
                res,
                statusCode: 401,
                message: 'Invalid credentials',
                success: false,
            });
        }

        return await sendTokenResponse(
            { user, message: 'User logged in successfully', isRegister: false },
            res,
        );
    } catch (error) {
        console.log(error);
        return await sendResponse({
            res,
            statusCode: 500,
            message: 'Server error',
            success: false,
        });
    }
}

/**
 * @route GET /api/auth/google/callback
 * @description Authenticate user with Google OAuth
 * @access Public
 * @body No body required
 */
async function googleAuthController(req, res) {
    try {
        console.log(req.user);

        const { emails, displayName, id } = req.user;

        const email = emails[0].value;

        let user = await findUserByEmail(email);

        if (!user) {
            user = await createUser({
                email,
                fullname: displayName,
                googleId: id,
            });
        }

        const token = jwt.sign(
            {
                _id: user._id,
                role: user.role,
            },
            config.JWT_SECRET,
            {
                expiresIn: '7d',
            },
        );

        res.cookie('token', token);

        return res.redirect(config.CLIENT_ORIGIN);
    } catch (error) {
        console.log(error);
        return await sendResponse({
            res,
            statusCode: 500,
            message: 'Server error',
            success: false,
        });
    }
}


/**
 * @route GET /api/auth/get-me
 * @description Get current logged in user
 * @access Private
 * @body No body required
 */
async function getMeController(req, res) {
    try {
        const userId = req.user?._id;

        if (!userId) {
            return await sendResponse({
                res,
                statusCode: 401,
                message: 'unauthorized access',
                success: false,
                error: 'user details not attached in the req',
            });
        }

        const user = await getCachedUser(userId);

        if (!user) {
            return await sendResponse({
                res,
                statusCode: 404,
                message: 'user not found',
                success: false,
                error: 'user not found',
            });
        }

        return await sendResponse({
            res,
            statusCode: 200,
            message: 'user found successfully',
            success: true,
            user,
        });
    } catch (error) {
        console.log(error);
        return await sendResponse({
            res,
            statusCode: 500,
            message: 'Server error',
            success: false,
        });
    }
}


/**
 * @route POST /api/auth/forgot-password
 * @description Send password reset email
 * @access Private
 * @body { email }
 */
async function forgotPasswordController(req, res) {
    try {
        const { email } = req.body;

        if (!email) {
            return await sendResponse({
                res,
                statusCode: 400,
                message: 'Email is required',
                success: false,
            });
        }

        const user = await findUserByEmail(email);

        if (!user) {
            return await sendResponse({
                res,
                statusCode: 404,
                message: 'User not found',
                success: false,
            });
        }

        const token = jwt.sign(
            {
                _id: user._id,
            },
            config.JWT_SECRET,
            {
                expiresIn: '1h',
            },
        );

        const resetUrl = `${config.CLIENT_ORIGIN}/reset-password?token=${token}`;

        await sendEmail({
            to: email,
            subject: 'Password Reset Request',
            html: resetPasswordEmailTemplate({ name: user.fullname, resetUrl }),
        });

        return await sendResponse({
            res,
            statusCode: 200,
            message: 'Password reset email sent successfully',
            success: true,
        });
    } catch (error) {
        console.log(error);

        return await sendResponse({
            res,
            statusCode: 500,
            message: 'Internal server error',
            success: false,
        });
    }
}

/**
 * @route POST /api/auth/update-password
 * @description Update user password
 * @access Private
 * @body { password }
 * @query { token }
 */
async function updatePasswordController(req, res) {
    try {
        const { password } = req.body;
        const { token } = req.query;

        if (!token) {
            return await sendResponse({
                res,
                statusCode: 400,
                message: 'Token is required',
                success: false,
            });
        }

        const decodedToken = jwt.verify(token, config.JWT_SECRET);

        const userId = decodedToken._id;

        const hasedPassword = await bcrypt.hash(password, 10);

        const user = await updateUserPassword(userId, hasedPassword);

        if (!user) {
            return await sendResponse({
                res,
                statusCode: 404,
                message: 'User not found',
                success: false,
            });
        }

        return await sendResponse({
            res,
            statusCode: 200,
            message: 'Password updated successfully',
            success: true,
        });
    } catch (error) {
        console.log(error);

        return await sendResponse({
            res,
            success: false,
            statusCode: 500,
            message: 'Internal server error',
        });
    }
}

/**
 * @route POST /api/auth/logout
 * @description Logout user by clearing token cookie and blacklisting the token in Redis
 * @access Private
 * @body No body required
 */
async function logoutController(req, res) {
    try {
        const token = req.cookies.token;

        if (!token) {
            return await sendResponse({
                res,
                statusCode: 400,
                message: 'Invalid token',
                success: false,
                error: 'token not found',
            });
        }

        res.clearCookie('token');

        await redis.set(
            `sciolto:blacklist:${token}`,
            Date.now().toString(),
            'EX',
            3600 * 24,
        );

        return await sendResponse({
            res,
            statusCode: 200,
            message: 'User logged out successfully',
            success: true,
        });
    } catch (error) {
        console.log(error);
        return await sendResponse({
            res,
            statusCode: 500,
            message: 'Server error',
            success: false,
        });
    }
}

export {
    RegsiterUserController,
    loginUserController,
    googleAuthController,
    getMeController,
    forgotPasswordController,
    updatePasswordController,
    logoutController,
};
