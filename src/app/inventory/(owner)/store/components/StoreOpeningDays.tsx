import React from 'react'
import {
    Box,
    Card,
    Grid,
    Typography,
} from '@mui/material'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { TimePicker } from '@mui/x-date-pickers';
import {daysMap} from "@/utils/generalFunctions";

export default function StoreOpeningDays({ title, formik, valuesFieldKey }: { title: string, formik: any, valuesFieldKey: string }) {
    function handleToggleOpen(index: number, open: boolean) {
        formik.setFieldValue(`${valuesFieldKey}.${index}.open`, !open)
    }

    function handleSetTime(index: number, key: string, value: any) {
        formik.setFieldValue(`${valuesFieldKey}.${index}.${key}`, value)
    }

    return (
        <Card variant={"outlined"} sx={{ padding: "10px" }}>
            <Grid container rowSpacing={2}>
                <Grid item xs={12}>
                    <Typography variant={"subtitle1"}>{title}</Typography>
                </Grid>

                <Grid container item xs={12} alignItems={"flex-start"} columnSpacing={1} sx={{ overflowX: "auto" }}>
                    {
                        formik.values[valuesFieldKey].map((item: any, index: number) => (
                            <Grid container item xs={true} justifyContent={"center"} key={index}>
                                <Grid container rowSpacing={1}>
                                    <Grid container item xs={12} justifyContent={"center"}>
                                        <Box
                                            sx={
                                                item.open ?
                                                    {
                                                        display: "inline-flex",
                                                        alignItems: "center",
                                                        justifyContent: "center",
                                                        borderRadius: "50%",
                                                        width: "43px",
                                                        height: "43px",
                                                        cursor: "pointer",
                                                        backgroundColor: "primary.main",
                                                        color: "white"
                                                    } : {
                                                        display: "inline-flex",
                                                        alignItems: "center",
                                                        justifyContent: "center",
                                                        border: "1px solid darkblue",
                                                        borderRadius: "50%",
                                                        width: "40px",
                                                        height: "40px",
                                                        cursor: "pointer",
                                                        fontWeight: 400,
                                                    }
                                            }
                                            onClick={() => handleToggleOpen(index, item.open)}
                                        >
                                            {/*@ts-ignore*/}
                                            {daysMap[item.weekDayNumber][0]}
                                        </Box>
                                    </Grid>

                                    {
                                        item.open && (
                                            <Grid item xs={12}>
                                                <LocalizationProvider dateAdapter={AdapterDayjs}>
                                                    <Grid container rowSpacing={2}>
                                                        <Grid container item xs={12} >
                                                            <Card variant={"outlined"} sx={{ padding: "10px 5px 5px 5px" }}>
                                                                <Grid container rowSpacing={1}>
                                                                    <Grid container item xs={12} justifyContent={"center"}>
                                                                        <TimePicker
                                                                            label={"Desde"}
                                                                            value={item.startTime}
                                                                            onChange={(value) => handleSetTime(index, "startTime", value)}
                                                                        />
                                                                    </Grid>

                                                                    <Grid container item xs={12} justifyContent={"center"}>
                                                                        <TimePicker
                                                                            label={"Hasta"}
                                                                            value={item.endTime}
                                                                            onChange={(value) => handleSetTime(index, "endTime", value)}
                                                                        />
                                                                    </Grid>
                                                                </Grid>
                                                            </Card>
                                                        </Grid>
                                                    </Grid>
                                                </LocalizationProvider>
                                            </Grid>
                                        )
                                    }
                                </Grid>
                            </Grid>
                        ))
                    }
                </Grid>
            </Grid>
        </Card>
    )
}
