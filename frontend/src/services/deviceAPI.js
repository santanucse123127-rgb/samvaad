import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const getHeaders = () => ({
    headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
});

export const initQrSession = async () => {
    const res = await axios.post(`${API_URL}/devices/qr-init`);
    return res.data;
};

export const authorizeQrSession = async (sessionId, deviceDetails) => {
    const res = await axios.post(
        `${API_URL}/devices/qr-authorize`,
        { sessionId, deviceDetails },
        getHeaders()
    );
    return res.data;
};

export const getLinkedDevices = async () => {
    const res = await axios.get(`${API_URL}/devices`, getHeaders());
    return res.data;
};

export const removeDevice = async (deviceId) => {
    const res = await axios.delete(`${API_URL}/devices/${deviceId}`, getHeaders());
    return res.data;
};
