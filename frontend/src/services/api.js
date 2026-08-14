import axios from "axios";

export const api = axios.create({
    baseURL: "http://localhost:8080",
    headers: {
        "Content-Type": "application/json"
    },
});

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("token");

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

api.interceptors.response.use(
    (response) => response,
    (error) => {

        const status = error.response?.status;
        const url = error.config?.url;

        const isLoginRequest =
            url?.includes("/auth/login");

        if (status === 401 && !isLoginRequest) {
            localStorage.removeItem("token");
            localStorage.removeItem("usuario");

            window.location.href = "/login";
        }

        return Promise.reject(error);
    }
);