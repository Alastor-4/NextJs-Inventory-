"use client"

import { SnackbarProvider } from "notistack";
import React from "react";
import { useStore } from "@/app/store/store"
import { Backdrop, CircularProgress } from "@mui/material";

export default function SnackBarContextProvider({ children }: { children: React.ReactNode }) {
    let loading = useStore((state) => state.loading)

    return (
        <SnackbarProvider maxSnack={3} dense anchorOrigin={{ horizontal: "center", vertical: "bottom" }}>
            {children}
            <Backdrop
                sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.modal + 1 }}
                open={loading}
            >
                <CircularProgress color="inherit" />
            </Backdrop>
        </SnackbarProvider>
    )
}
