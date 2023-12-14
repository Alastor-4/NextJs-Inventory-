import NextAuth from "next-auth";

declare module "next-auth" {
    /**
     * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
     */

    interface User {
        id: number,
        username: string,
        role_id: number | null,
        is_active: boolean | null,
        is_verified: boolean
    }
    interface Session {
        user: User;
    }
    // interface Session {
    //     user: {
    //         id: number,
    //         username: string,
    //         role_id: number,
    //         is_active: boolean,
    //         is_verified: boolean
    //     }
    // }
}