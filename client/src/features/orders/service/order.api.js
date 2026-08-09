import axios from 'axios';

const orderApiInstance = axios.create({
    baseURL: '/api/orders',
    withCredentials: true,
});

export async function getUserOrders() {
    const response = await orderApiInstance.get('/');
    return response.data;
}
