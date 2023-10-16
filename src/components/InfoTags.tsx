import {Box} from "@mui/material";
import {CreditCardOutlined, ErrorOutlined, InfoOutlined} from "@mui/icons-material";

export const MoneyInfoTag = ({value, errorColor}) => {
    return (
        <Box
            sx={
                {
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: `${errorColor ? "darkred" : "darkblue"}`,
                    margin: "3px 5px",
                    border: "2px solid black",
                    padding: "3px",
                    borderRadius: "8px 3px 3px 3px",
                    fontWeight: 600,
                }
            }
        >
            {
                errorColor
                    ? <ErrorOutlined sx={{mr: "5px"}} fontSize={"small"}/>
                    : <CreditCardOutlined sx={{mr: "5px"}} fontSize={"small"}/>
            }

            {value}
        </Box>
    )
}


export const InfoTag = ({value, color, icon}) => {
    return (
        <Box
            sx={
                {
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: `${color ? color : "gray"}`,
                    margin: "3px 5px",
                    border: "2px solid darkgray",
                    padding: "3px",
                    borderRadius: "8px 3px 3px 3px",
                    fontWeight: 400,
                }
            }
        >
            {
                icon
                    ? icon
                    : <InfoOutlined sx={{mr: "5px"}} fontSize={"small"}/>
            }
            {value}
        </Box>
    )
}