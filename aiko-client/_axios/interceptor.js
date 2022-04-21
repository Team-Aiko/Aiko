import axios from 'axios';
import { resetUserInfo } from '../_redux/accountReducer';
import { setMember } from '../_redux/memberReducer';
import Router from 'next/router';
import store from '../_redux/store';

const axiosInstance = axios.create();

axiosInstance.interceptors.response.use(
    async (response) => {
        return response.data.result;
    },
    async (error) => {
        const obj = { ...error };
        const { url, method } = obj.config;
        const { appCode, httpCode, description } = obj.response.data;

        switch (appCode) {
            case -1: {
                store.dispatch(resetUserInfo());
                store.dispatch(setMember([]));

                Router.push('/');
                break;
            }
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

const { get, post } = axiosInstance;

export default axiosInstance;
export { get, post };
