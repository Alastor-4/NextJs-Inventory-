import React from 'react'
import {
    Box,
    Card,
    Grid,
    IconButton,
    Typography,
} from '@mui/material'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { TimePicker } from '@mui/x-date-pickers';
import {AddOutlined, Cancel, CancelOutlined, Close, DeleteOutline, RemoveDone} from "@mui/icons-material";
import dayjs from "dayjs";

export default function StoreOpeningDays({formik}: {formik: any}) {
    const daysMap = {
        1: "D",
        2: "L",
        3: "M",
        4: "X",
        5: "J",
        6: "V",
        7: "S",
    }

    function handleToggleOpen(index: number, open: boolean) {
        formik.setFieldValue(`openingDays.${index}.open`, !open)
    }

    function handleSetTime(index: number, timeIndex: number, key: string, value: any) {
        formik.setFieldValue(`openingDays.${index}.times.${timeIndex}.${key}`, value)
    }

    function handleAddTime(index: number) {
        let openingDays = [...formik.values.openingDays]

        let times = formik.values.openingDays[index].times
        times.push({startTime: dayjs(), endTime: dayjs()})

        openingDays[index].times = times

        formik.setFieldValue("openingDays", openingDays)
    }

    function handleRemoveTime(index: number, timeIndex: number) {
        let openingDays = [...formik.values.openingDays]

        let times = formik.values.openingDays[index].times
        times.splice(timeIndex, 1)

        openingDays[index].times = times

        formik.setFieldValue("openingDays", openingDays)
    }

    return (
        <Card variant={"outlined"} sx={{padding: "10px"}}>
            <Grid container rowSpacing={2}>
                <Grid item xs={12}>
                    <Typography variant={"subtitle1"}>Apertura de la tienda</Typography>
                </Grid>

                <Grid container item xs={12} alignItems={"flex-start"} columnSpacing={1} sx={{overflowX: "auto"}}>
                    {
                        formik.values.openingDays.map((item: any, index: number) => (
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
                                                        border: "1px solid darkblue",
                                                        borderRadius: "50%",
                                                        width: "43px",
                                                        height: "43px",
                                                        cursor: "pointer",
                                                        backgroundColor: "lightslategray",
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
                                            {daysMap[item.weekDayNumber]}
                                        </Box>
                                    </Grid>

                                    {
                                        item.open && (
                                            <Grid item xs={12}>
                                                <LocalizationProvider dateAdapter={AdapterDayjs}>
                                                    <Grid container rowSpacing={2}>
                                                        {
                                                            item.times.map((timeItem: any, timeIndex: number) => (
                                                                <Grid container item xs={12} key={timeIndex}>
                                                                    <Card variant={"outlined"} sx={{padding: "10px 5px 5px 5px"}}>
                                                                        <Grid container rowSpacing={1}>
                                                                            {
                                                                                timeIndex > 0 && (
                                                                                    <Grid container item xs={12} justifyContent={"flex-end"}>
                                                                                        <Close
                                                                                            fontSize={"small"}
                                                                                            sx={{cursor: "pointer"}}
                                                                                            onClick={() => handleRemoveTime(index, timeIndex)}
                                                                                        />
                                                                                    </Grid>
                                                                                )
                                                                            }
                                                                            <Grid container item xs={12} justifyContent={"center"}>
                                                                                <TimePicker
                                                                                    label={"Desde"}
                                                                                    value={timeItem.startTime}
                                                                                    onChange={(value) => handleSetTime(index, timeIndex, "startTime", value)}
                                                                                />
                                                                            </Grid>

                                                                            <Grid container item xs={12} justifyContent={"center"}>
                                                                                <TimePicker
                                                                                    label={"Hasta"}
                                                                                    value={timeItem.endTime}
                                                                                    onChange={(value) => handleSetTime(index, timeIndex, "endTime", value)}
                                                                                />
                                                                            </Grid>
                                                                        </Grid>
                                                                    </Card>
                                                                </Grid>
                                                            ))
                                                        }

                                                        <Grid container item xs={12} justifyContent={"flex-end"}>
                                                            <IconButton
                                                                color={"default"}
                                                                size={"small"}
                                                                onClick={() => handleAddTime(index)}
                                                            >
                                                                <AddOutlined/>
                                                            </IconButton>
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
