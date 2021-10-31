import axios from 'axios';

const axiosInstance = axios.create();

axiosInstance.interceptors.response.use(
    async (response) => {
        console.log('res = ', response);
        return response.data.result;
    },
    async (error) => {
        const obj = { ...error };
        const { url, method } = obj.config;
        const { appCode, httpCode, description } = obj.response.data;

        switch (appCode) {
            case 0: {
                break;
            }
            case 1: {
                break;
            }
            case 2: {
                await axiosInstance.post('/api/account/access-token');
                return 2;
            }
        }

        return { appCode, httpCode, description };
    },
);

export default axiosInstance;
