import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import { config } from './config/config.js';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';

import authRouter from './routes/auth.routes.js';
import productRouter from './routes/product.routes.js';
import cartRouter from './routes/cart.routes.js';
import appRouter from './routes/app.routes.js';
import categoryRouter from './routes/category.route.js';
import paymentRouter from './routes/payment.routes.js';
import orderRouter from './routes/order.routes.js';

import { blockSuspiciousRequests } from './middlewares/app.middleware.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.set('trust proxy', true);

const publicDir = path.join(__dirname, '../public');

// Server Middleware setup
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(cookieParser());
app.use(morgan('dev'));
app.use(
    cors({
        origin: config.CLIENT_ORIGIN,
        credentials: true,
    }),
);

app.use(blockSuspiciousRequests);
app.use(express.static(publicDir));

//Googe OAuth setup
app.use(passport.initialize());

passport.use(
    new GoogleStrategy(
        {
            clientID: config.GOOGLE_CLIENT_ID,
            clientSecret: config.GOOGLE_CLIENT_SECRET,
            callbackURL: `/api/auth/google/callback`,
            proxy: true,
        },
        (accessToken, refreshToken, profile, done) => {
            //Here we can handle the user profile returned by Google and create or find a user in our database
            //For simplicity, we'll just return the profile
            return done(null, profile);
        },
    ),
);

// Routes setup
app.use('/api/auth', authRouter);
app.use('/api/products', productRouter);
app.use('/api/cart', cartRouter);
app.use('/api/categories', categoryRouter);
app.use('/api/payments', paymentRouter);
app.use('/api/orders', orderRouter);
app.use('/', appRouter);

export default app;
