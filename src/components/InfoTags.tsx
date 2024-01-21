import { ClickAwayListener, Grid, Tooltip } from "@mui/material";
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