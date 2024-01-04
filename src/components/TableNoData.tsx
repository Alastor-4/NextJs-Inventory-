import { Box } from "@mui/material";
import { Cached, InfoOutlined, SearchOff } from "@mui/icons-material";

interface TableNoDataProps {
    hasData?: number | null;
    searchCoincidence?: boolean;
}

export const TableNoData = ({ hasData, searchCoincidence }: TableNoDataProps) => {
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
            {searchCoincidence ? <><SearchOff sx={{ mr: "5px" }} /> No se encontraron coincidencias...</> :
                !hasData ?
                    <><InfoOutlined sx={{ mr: "5px" }} />No hay datos que mostrar</>
                    : <><Cached sx={{ mr: "5px" }} /> Cargando datos...</>

            }
        </Box>
    )
}