import {Box, Grid, Typography} from "@mui/material";
import React from "react";

export default function DepartmentCustomButton(
    {title, subtitle, selected, onClick}: {title: string, subtitle: string, selected: boolean, onClick: React.MouseEventHandler<HTMLDivElement>}
) {
    return (
        <Box
            sx={{
                padding: "4px 8px",
                border: "1px solid white",
                borderRadius: "4px",
                color: selected ? "white" : "primary.main",
                background: selected ? "rgba(25,118,210,0.8)" : "rgba(228,236,245,0.8)",
                cursor: "pointer",
            }}
            onClick={onClick}
        >
            <div>
                <Grid container justifyContent={"center"}>
                    <Typography component={"div"} variant={"button"}>
                        {title}
                    </Typography>
                </Grid>

                <Grid container justifyContent={"center"}>
                    <Typography component={"div"} variant={"subtitle2"} fontSize={13}>
                        {subtitle}
                    </Typography>
                </Grid>
            </div>
        </Box>
    )
}