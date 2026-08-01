import { describe, it, expect, vi, beforeEach } from 'vitest';
import { findPaymentByOrderId, updatePaymentStatus, createPaymentRecord } from '../dao/payment.dao.js';
import paymentModel from '../models/payment.model.js';

// Mock Mongoose Payment Model
vi.mock('../models/payment.model.js', () => ({
    default: {
        findOne: vi.fn(),
        findOneAndUpdate: vi.fn(),
        create: vi.fn(),
    },
}));

describe('Payment DAO', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('createPaymentRecord', () => {
        it('should call paymentModel.create with an array containing paymentData and options to prevent Mongoose validation issues', async () => {
            const paymentData = {
                user: 'user-id',
                price: { amount: 1000, currency: 'INR' },
                status: 'pending'
            };
            const session = { id: 'session-id' };
            const mockCreated = { ...paymentData, _id: 'payment-id' };

            // paymentModel.create should return an array of created docs when first arg is an array
            paymentModel.create.mockResolvedValue([mockCreated]);

            const result = await createPaymentRecord(paymentData, session);

            expect(paymentModel.create).toHaveBeenCalledWith([paymentData], { session, ordered: true });
            expect(result).toEqual(mockCreated);
        });

        it('should handle undefined session', async () => {
            const paymentData = {
                user: 'user-id',
                price: { amount: 1000, currency: 'INR' },
                status: 'pending'
            };
            const mockCreated = { ...paymentData, _id: 'payment-id' };

            paymentModel.create.mockResolvedValue([mockCreated]);

            const result = await createPaymentRecord(paymentData);

            expect(paymentModel.create).toHaveBeenCalledWith([paymentData], {});
            expect(result).toEqual(mockCreated);
        });
    });

    describe('findPaymentByOrderId', () => {
        it('should find payment by razorpay order ID', async () => {
            const mockPayment = { _id: 'payment-id', razorpay: { orderId: 'rzp-123' } };
            paymentModel.findOne.mockResolvedValue(mockPayment);

            const result = await findPaymentByOrderId('rzp-123');

            expect(paymentModel.findOne).toHaveBeenCalledWith({ 'razorpay.orderId': 'rzp-123' }, null, {});
            expect(result).toBe(mockPayment);
        });

        it('should find payment by razorpay order ID with session options', async () => {
            const mockPayment = { _id: 'payment-id', razorpay: { orderId: 'rzp-123' } };
            const session = { id: 'session-id' };
            paymentModel.findOne.mockResolvedValue(mockPayment);

            const result = await findPaymentByOrderId('rzp-123', session);

            expect(paymentModel.findOne).toHaveBeenCalledWith({ 'razorpay.orderId': 'rzp-123' }, null, { session });
            expect(result).toBe(mockPayment);
        });
    });

    describe('updatePaymentStatus', () => {
        it('should update payment status by order ID', async () => {
            const mockPayment = { _id: 'payment-id', status: 'paid' };
            paymentModel.findOneAndUpdate.mockResolvedValue(mockPayment);

            const result = await updatePaymentStatus('rzp-123', { status: 'paid' });

            expect(paymentModel.findOneAndUpdate).toHaveBeenCalledWith(
                { 'razorpay.orderId': 'rzp-123' },
                { status: 'paid' },
                { new: true }
            );
            expect(result).toBe(mockPayment);
        });

        it('should update payment status by order ID with session options', async () => {
            const mockPayment = { _id: 'payment-id', status: 'paid' };
            const session = { id: 'session-id' };
            paymentModel.findOneAndUpdate.mockResolvedValue(mockPayment);

            const result = await updatePaymentStatus('rzp-123', { status: 'paid' }, session);

            expect(paymentModel.findOneAndUpdate).toHaveBeenCalledWith(
                { 'razorpay.orderId': 'rzp-123' },
                { status: 'paid' },
                { session, new: true }
            );
            expect(result).toBe(mockPayment);
        });
    });
});
