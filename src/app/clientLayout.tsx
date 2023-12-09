"use client"

import { SnackbarProvider } from "notistack";
import React from "react";
import { useStore } from "@/app/store/store"
import { Backdrop, CircularProgress } from "@mui/material";
import { SessionProvider } from "next-auth/react";

export default function ClientLayout({ children }: { children: React.ReactNode }) {

    let loading = useStore((state) => state.loading)

    return (
        <SessionProvider>
            <SnackbarProvider maxSnack={3} dense anchorOrigin={{ horizontal: "center", vertical: "bottom" }}>
                {children}
                <Backdrop
                    sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.modal + 1 }}
                    open={loading}
                >
                    <CircularProgress color="inherit" />
                </Backdrop>
            </SnackbarProvider>
        </SessionProvider>
    )
}
