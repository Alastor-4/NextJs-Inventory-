import React from "react";
import {ClickAwayListener, Tooltip} from "@mui/material";

interface CustomTooltip {
    isOpenTooltip: boolean,
    handleTooltipClose: any,
    message: string,
    children: React.ReactElement
}

export default function InfoTooltip({isOpenTooltip, handleTooltipClose, message, children}: CustomTooltip) {

    return (
        <ClickAwayListener onClickAway={handleTooltipClose}>
            <Tooltip
                onClose={handleTooltipClose}
                open={isOpenTooltip}
                placement="bottom-start"
                arrow
                title={message}
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
                {children}
            </Tooltip>
        </ClickAwayListener>
    )
}


