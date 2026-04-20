import axios from 'axios';

export const axiosInstance = axios.create({
    baseURL: "https://chatify-app-v7ci.onrender.com/api",
    withCredentials: true,
})