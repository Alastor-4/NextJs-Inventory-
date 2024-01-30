import axios from "axios";

interface checkRegisterDataProps {
    username: string;
    phone: string;
    email: string;
}

export const checkRegisterData = async ({ username, phone, email }: checkRegisterDataProps) => {
    try {
        const res = await axios.post('/api/auth/register/verify-register-data', { username, phone, email });
        if (res.status === 200) return res.data;
        return [];

    } catch (error) {
        throw new Error("Error", error!)
    }
};