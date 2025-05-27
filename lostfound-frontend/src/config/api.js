const API_CONFIG = {
    BASE_URL: 'http://0.0.0.0:3000',
    ENDPOINTS : {
        AUTH: {
            LOGIN: '/auth/login',
            REGISTER: '/auth/register',
            VERIFY_EMAIL: '/auth/verify-email',
            FORGOT_PASSWORD: '/auth/forgot-password',
            RESET_PASSWORD: '/auth/reset-password',
            CHANGE_PASSWORD: '/auth/change-password',
            CONFIRM_PASSWORD_CHANGE: '/auth/confirm-password-change',
        },
        USER: {
            REPORT: '/user/report',
            MY_REPORTS: '/user/my-reports',
        },
        ITEMS: {
            LOST: '/lost-items',
            FOUND: '/found-items',
        }
    }
};

export default API_CONFIG;