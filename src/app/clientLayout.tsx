"use client"

import {SnackbarProvider} from "notistack";
import React from "react";

export default function ClientLayout({children}: {children: React.ReactNode}) {
    return (
        <SnackbarProvider maxSnack={3} dense anchorOrigin={{horizontal: "center", vertical: "bottom"}}>
            {children}
        </SnackbarProvider>
    )
}
