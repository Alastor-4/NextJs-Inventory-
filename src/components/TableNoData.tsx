import { Box } from "@mui/material";
import { Cached, InfoOutlined } from "@mui/icons-material";

interface TableNoDataProps {
    hasData?: number | null;
}

export const TableNoData = ({ hasData }: TableNoDataProps) => {
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
            {!hasData ?
                <><InfoOutlined sx={{ mr: "5px" }} />No hay datos que mostrar</>
                : <><Cached sx={{ mr: "5px" }} /> Cargando datos...</>
            }
        </Box>
    )
}