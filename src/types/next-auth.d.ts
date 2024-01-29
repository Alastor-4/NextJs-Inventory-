import { DefaultSession, DefaultUser } from "next-auth";

declare module "next-auth" {
    /**
     * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
     */

    interface User extends DefaultUser {
        id: number,
        username: string,
        role_id: number | null,
        is_active: boolean | null,
        is_verified: boolean,
        error?: string | null,
    }
    interface Session {
        user: User & DefaultSession;
    }
}