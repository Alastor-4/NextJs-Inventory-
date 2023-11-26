import axios from "axios"
import {startLoading, stopLoading} from "@/app/store/store"

const apiRequest = axios.create({
    headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
    },
});

apiRequest.interceptors.request.use(
    config => {
        startLoading()

        return config
    },
    error => {
        stopLoading()

        return Promise.reject(error)
    },
);

apiRequest.interceptors.response.use(
    (response) => {
        stopLoading()

        return response
    },
    async (error) => {
        stopLoading()

        return Promise.reject(error)

    },
);

export default apiRequest
