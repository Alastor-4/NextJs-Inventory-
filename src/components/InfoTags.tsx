import {ClickAwayListener, Grid, Tooltip, Typography} from "@mui/material";
import { CreditCardOutlined, ErrorOutlined, InfoOutlined } from "@mui/icons-material";
import React, { useState } from "react";

export const MoneyInfoTag = ({ value, errorColor, action }: any) => {
    return (
        <Grid
            container
            display={"inline-flex"}
            width={"fit-content"}
            flexWrap={"nowrap"}
            flexDirection={"row"}
            alignItems={"center"}
            whiteSpace={"nowrap"}
            margin={"0 5px"}
            border={"2px solid black"}
            padding={"3px"}
            borderRadius={"8px 3px 3px 3px"}
            fontWeight={600}
            color={errorColor ? "darkred" : "darkblue"}
            onClick={(e) => {
                e.stopPropagation()
                action ? action() : null
            }}
        >
            <Grid item xs={"auto"}>
                {
                    errorColor
                        ? <ErrorOutlined sx={{ mr: "5px" }} fontSize={"small"} />
                        : <CreditCardOutlined sx={{ mr: "5px" }} fontSize={"small"} />
                }
            </Grid>
            <Grid item xs={true}>
                {value}
            </Grid>
        </Grid>
    )
}


export const InfoTag = ({ value, color, tooltipText }: any) => {
    const [open, setOpen] = React.useState(false)

    return (
        <div
            onClick={event => event.stopPropagation()}
        >
            {
                tooltipText ? (
                    <ClickAwayListener onClickAway={() => setOpen(false)}>
                        <Tooltip
                            title={tooltipText}
                            open={open}
                            placement="bottom-start"
                            arrow
                            PopperProps={{
                                disablePortal: true,
                                sx: {
                                    "& .MuiTooltip-tooltip": {
                                        padding: "5px 10px",
                                        maxWidth: "300px",
                                        lineHeight: "1.7em",
                                        border: "none",
                                        borderRadius: "3px",
                                        backgroundColor: "#2F323A",
                                        textAlign: "center",
                                        fontSize: "16px",
                                        fontStyle: "normal",
                                        fontWeight: "400",
                                        overflowWrap: "break-word",
                                        wordWrap: "normal",
                                        whiteSpace: "normal",
                                        lineBreak: "auto",
                                    }
                                }
                            }}
                        >
                            <Grid
                                container
                                display={"inline-flex"}
                                width={"fit-content"}
                                flexWrap={"nowrap"}
                                flexDirection={"row"}
                                alignItems={"center"}
                                whiteSpace={"nowrap"}
                                margin={"0 5px"}
                                fontWeight={600}
                                color={color ? color : "gray"}
                                onClick={() => setOpen(true)}
                            >
                                <Grid item xs={"auto"}>
                                    {value}
                                </Grid>
                                <Grid container item xs={"auto"} alignItems={"center"}>
                                    <InfoOutlined sx={{ ml: "5px" }} fontSize={"small"} />
                                </Grid>
                            </Grid>
                        </Tooltip>
                    </ClickAwayListener>
                ) : (
                    <Grid
                        container
                        display={"inline-flex"}
                        width={"fit-content"}
                        flexWrap={"nowrap"}
                        flexDirection={"row"}
                        alignItems={"center"}
                        whiteSpace={"nowrap"}
                        margin={"0 5px"}
                        fontWeight={600}
                        color={color ? color : "gray"}
                    >
                        <Grid item xs={"auto"}>
                            {value}
                        </Grid>
                    </Grid>
                )
            }
        </div>
    )
}

interface CustomTooltipProps {
    tooltipText: string;
    children?: React.ReactNode;
}

export const CustomTooltip = ({ tooltipText, children }: CustomTooltipProps) => {
    const [open, setOpen] = React.useState(false)

    return (
        <ClickAwayListener onClickAway={() => setOpen(false)}>
            <Tooltip
                title={tooltipText}
                open={open}
                placement="bottom-start"
                arrow
                PopperProps={{
                    disablePortal: true,
                    sx: {
                        "& .MuiTooltip-tooltip": {
                            padding: "5px 10px",
                            maxWidth: "300px",
                            lineHeight: "1.7em",
                            border: "none",
                            borderRadius: "3px",
                            backgroundColor: "#2F323A",
                            textAlign: "center",
                            fontSize: "16px",
                            fontStyle: "normal",
                            fontWeight: "400",
                            overflowWrap: "break-word",
                            wordWrap: "normal",
                            whiteSpace: "normal",
                            lineBreak: "auto",
                        }
                    }
                }}
            >
                <div
                    onClick={(e) => {
                        e.stopPropagation()
                        return setOpen(true)
                    }}>
                    {children}
                </div>
            </Tooltip>
        </ClickAwayListener>
    )
}

export const CharacteristicInfoTag = ({ name, value, disabled }: {name: string, value: string, disabled?: boolean}) => {
    return (
        <Grid
            sx={{
                display: "inline-flex",
                margin: "3px",
                backgroundColor: "rgba(170, 170, 170, 0.8)",
                padding: "2px 4px",
                borderRadius: "5px 2px 2px 2px",
                border: "1px solid rgba(130, 130, 130)",
                fontSize: 14,
                textDecoration: disabled ? "line-through" : "none",
            }}
        >
            <Grid container item alignItems={"center"} sx={{ marginRight: "3px" }}>
                <Typography variant={"caption"} sx={{ color: "black", fontWeight: "600" }}>
                    {name.toUpperCase()}
                </Typography>
            </Grid>

            <Grid container item alignItems={"center"} sx={{ color: "rgba(16,27,44,0.8)", fontWeight: "600" }}>
                {value}
            </Grid>
        </Grid>
    )
}