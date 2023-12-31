import {Grid} from "@mui/material";
import {CreditCardOutlined, ErrorOutlined, InfoOutlined} from "@mui/icons-material";

export const MoneyInfoTag = ({value, errorColor}: any) => {
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
        >
            <Grid item xs={"auto"}>
                {
                    errorColor
                        ? <ErrorOutlined sx={{mr: "5px"}} fontSize={"small"}/>
                        : <CreditCardOutlined sx={{mr: "5px"}} fontSize={"small"}/>
                }
            </Grid>
            <Grid item xs={true}>
                {value}
            </Grid>
        </Grid>
    )
}


export const InfoTag = ({value, color, icon}: any) => {
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
            color={color ? color : "gray"}
        >
            <Grid item xs={"auto"}>
                {
                    icon
                        ? icon
                        : <InfoOutlined sx={{mr: "5px"}} fontSize={"small"}/>
                }
            </Grid>
            <Grid item xs={"auto"}>
                {value}
            </Grid>
        </Grid>
    )
}