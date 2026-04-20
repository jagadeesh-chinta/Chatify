import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || "https://chatify-app-v7ci.onrender.com";

export const axiosInstance = axios.create({
    baseURL: `${API_URL}/api`,
    withCredentials: true,
})