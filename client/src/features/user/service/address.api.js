import axios from 'axios';

const addressApiInstance = axios.create({
    baseURL: '/api/address',
    withCredentials: true,
});

export async function fetchAddresses() {
    const response = await addressApiInstance.get('/');
    return response.data;
}

export async function createAddress(data) {
    const response = await addressApiInstance.post('/', data);
    return response.data;
}

export async function updateAddress(id, data) {
    const response = await addressApiInstance.put(`/${id}`, data);
    return response.data;
}

export async function deleteAddress(id) {
    const response = await addressApiInstance.delete(`/${id}`);
    return response.data;
}
