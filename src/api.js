import axios from "axios"

const apiRequest = axios.create({
    headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
    },
});

apiRequest.interceptors.request.use(
    config => {
        // const token = Vue.$cookies.get('authToken');
        // if (token) {
        //   config.headers.common.Authorization = `Bearer ${token}`
        // }
        // if (!store.state.isLoading && store.state.useLoading) {
        //   store.commit('SET_LOADING', true)
        // }

        return config
    },
    error => {
        // store.commit('SET_LOADING', false)
        return Promise.reject(error)
    },
);

apiRequest.interceptors.response.use(
    (response) => {
        //store.commit('SET_LOADING', false)
        return response
    },
    async (error) => {
        // setTimeout(() => {
        //     store.commit('SET_LOADING', false)
        // }, 1000)

        return Promise.reject(error)

    },
);

export default apiRequest
