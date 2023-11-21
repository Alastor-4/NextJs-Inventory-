import React, { useEffect, useState } from 'react'
import { Box, Card, Grid, Typography } from '@mui/material'
import { LocalizationProvider, TimeField, TimePicker } from '@mui/x-date-pickers'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import { LockClockOutlined } from '@mui/icons-material';

function ShowSchedule(props: any) {
    const { title, schedule } = props;

    const daysMap: any = {
        1: "D",
        2: "L",
        3: "M",
        4: "X",
        5: "J",
        6: "V",
        7: "S",
    }

    const [dataSchedule, setDataSchedule] = useState(Array.from({ length: 7 }, (data: any, index: any) => ({
        id: null,
        weekDayNumber: index + 1,
        open: false,
        startTime: null,
        endTime: null
    })));

    useEffect(() => {
        let newDataSchedule: any = [...dataSchedule];
        schedule.forEach((dataDay: any) => {
            const ind = dataDay.week_day_number - 1
            newDataSchedule[ind].id = dataDay.id
            newDataSchedule[ind].open = true
            newDataSchedule[ind].startTime = dayjs(dataDay.day_start_time)
            newDataSchedule[ind].endTime = dayjs(dataDay.day_end_time)
        })
        setDataSchedule(newDataSchedule)
    }, [schedule])

    return (
        <>
            <Card variant={"outlined"} sx={{ padding: "10px" }}>
                <Grid container rowSpacing={2}>
                    <Grid item xs={12}>
                        <Typography variant={"subtitle1"} >{title}</Typography>
                    </Grid>

                    <Grid container item xs={12} alignItems={"flex-start"} columnSpacing={1} sx={{ overflowX: "auto" }}>
                        {
                            dataSchedule.map((item: any, index: number) => (
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
                                                            backgroundColor: "primary.main",
                                                            color: "white",
                                                            cursor: 'default'
                                                        } : {
                                                            display: "inline-flex",
                                                            alignItems: "center",
                                                            justifyContent: "center",
                                                            border: "1px solid darkblue",
                                                            borderRadius: "50%",
                                                            width: "40px",
                                                            height: "40px",
                                                            fontWeight: 400,
                                                            cursor: 'default'
                                                        }
                                                }
                                            >

                                                {daysMap[item.weekDayNumber]}
                                            </Box>
                                        </Grid>

                                        {
                                            item.open
                                                ? (
                                                    <Grid item xs={12}>
                                                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                                                            <Grid container rowSpacing={2}>

                                                                <Grid container item xs={12} >
                                                                    <Card variant={"outlined"} sx={{ padding: "10px 5px 5px 5px" }}>
                                                                        <Grid container rowSpacing={1}>

                                                                            <Grid container item xs={12} justifyContent={"center"}>
                                                                                <TimeField
                                                                                    label={"Desde"}
                                                                                    value={item.startTime}
                                                                                    readOnly
                                                                                    sx={{
                                                                                        '.MuiInputBase-input': {
                                                                                            textAlign: 'center',
                                                                                        }
                                                                                    }}
                                                                                />
                                                                            </Grid>

                                                                            <Grid container item xs={12} justifyContent={"center"}>
                                                                                <TimeField
                                                                                    label={"Hasta"}
                                                                                    value={item.endTime}
                                                                                    readOnly
                                                                                    sx={{
                                                                                        '.MuiInputBase-input': {
                                                                                            textAlign: 'center',
                                                                                        }
                                                                                    }}

                                                                                />
                                                                            </Grid>
                                                                        </Grid>
                                                                    </Card>
                                                                </Grid>


                                                            </Grid>
                                                        </LocalizationProvider>
                                                    </Grid>
                                                )
                                                : (
                                                    <Grid item container sx={{ height: '100%' }} justifyContent={'center'} alignItems={'self-end'} >
                                                        <Grid item>
                                                            <LockClockOutlined fontSize='large' color='disabled' />
                                                        </Grid>

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

        </>
    )
}

export default ShowSchedule
