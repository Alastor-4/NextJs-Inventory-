import { withAuth, NextRequestWithAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
    function middleware(request: NextRequestWithAuth) {
        const role_id = +request.nextauth.token?.role_id!;
        const pathMatch = (path: string): boolean => request.nextUrl.pathname.startsWith(`${path}`);
        const inventoryPath = NextResponse.redirect(new URL('/inventory', request.url));

        //Only Admins
        if (pathMatch('/inventory/admin') && role_id !== 1) return inventoryPath;

        //Only Owners
        if (pathMatch('/inventory/owner') && role_id !== 2) return inventoryPath;

        //Only Keepers
        if (pathMatch('/inventory/keeper') && role_id !== 4) return inventoryPath;

        //Only Owners & Keepers & Sellers
        if (pathMatch('/inventory/seller') && ![2, 4, 3].includes(role_id)) return inventoryPath;
    },
    {
        callbacks: {
            authorized: ({ token }) => !!token,
        },
    }
)

export const config = { matcher: ["/inventory/:path*"] }