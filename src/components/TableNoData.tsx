// @ts-nocheck
import {Box} from "@mui/material";
import {InfoOutlined} from "@mui/icons-material";

export const TableNoData = () => {
    return (
        <Box
            sx={
                {
                    width: "100%",
                    height: "100px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#a9afbb"
                }
            }
        >
            <InfoOutlined sx={{mr: "5px"}}/>
            No hay datos que mostrar
        </Box>
    )
}