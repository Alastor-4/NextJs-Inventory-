import { withAuth, NextRequestWithAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
    function middleware(request: NextRequestWithAuth) {
        //Para Admins
        if (request.nextUrl.pathname.startsWith('/inventory/admin') && request.nextauth.token?.role_id !== 1) {
            if (request.nextauth.token?.role_id) {
                return NextResponse.redirect(new URL('/inventory', request.url));
            }
            return NextResponse.rewrite(new URL('/', request.url));
        }

        //Para Owners
        if (request.nextUrl.pathname.startsWith('/inventory/owner') && request.nextauth.token?.role_id !== 2) {
            if (request.nextauth.token?.role_id) {
                return NextResponse.redirect(new URL('/inventory', request.url));
            }
            return NextResponse.rewrite(new URL('/', request.url));
        }

        //Para Sellers
        if (request.nextUrl.pathname.startsWith('/inventory/seller') && ![2, 3, 4].includes(+request.nextauth.token?.role_id!)) {
            if (request.nextauth.token?.role_id) {
                return NextResponse.redirect(new URL('/inventory', request.url));
            }
            return NextResponse.rewrite(new URL('/', request.url));
        }

        if (!request.nextauth.token?.role_id) {
            return NextResponse.redirect(new URL('/', request.url));
        }
    },
    {
        callbacks: {
            authorized: ({ token }) => !!token,
        },
    }
)

export const config = { matcher: ["/inventory/:path*"] }