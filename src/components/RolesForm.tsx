"use client"

import {AppBar, Box, Card, Grid, Toolbar, Typography} from "@mui/material";
import React from "react";

export default function RolesForm(props) {
    const {updateItem} = props

    const CustomToolbar = () => (
        <AppBar position={"static"} variant={"elevation"} color={"primary"}>
            <Toolbar sx={{display: "flex", justifyContent: "space-between", color: "white"}}>
                <Box>
                    <Typography
                        variant="h6"
                        noWrap
                        sx={{
                            fontWeight: 700,
                            letterSpacing: ".2rem",
                            color: "white",
                        }}
                    >
                        {updateItem ? "Modificar rol" : "Crear role"}
                    </Typography>
                </Box>
            </Toolbar>
        </AppBar>
    )

    return (
        <Card variant={"outlined"}>
            <Grid container spacing={2}>
                <Grid item xs={12}>
                    <CustomToolbar/>
                </Grid>

                <Grid item xs={12}>
                    form
                </Grid>
            </Grid>
        </Card>
    )
}