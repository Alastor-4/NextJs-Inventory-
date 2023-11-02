import { LockOpen, LockOutlined } from '@mui/icons-material'
import { Box, Button, Card, Checkbox, Grid, IconButton, MenuItem, Stack, TextField, Zoom } from '@mui/material'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import React, { useState, useEffect } from 'react'
import StoreModalDefault from '../../store-details/[storeDetailsId]/components/Modal/StoreModalDefault'
import dayjs from 'dayjs';
import { TimePicker } from '@mui/x-date-pickers';
import { Formik } from 'formik';
import * as Yup from 'yup'


function WorkDays(props: any) {
    const { dataWorkDays, setDataWorkDays } = props;
    const weekDays = ['Domingo', 'Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sábado']
    
    // Guarda el indice de la fila para activar su checkbox
    const [activeCheckbox, setActiveCheckbox] = useState(null)

    //Se usan para activar los modal
    const [activeModalEditSchedule, setActiveModalEditSchedule] = useState<any>(false)
    const [activeModalReplicateSchedules, setActiveModalReplicateSchedules] = useState(false)

    // Guarda el indice del dia q se va a modificar
    const [indEditSchedule, setIndEditSchedule] = useState(Number)

    // se encarga de darle tiempo al estilo de Vibration para
    // q pueda hacer su animacion
    useEffect(() => {
        if (activeCheckbox !== null) {
            if (!dataWorkDays[activeCheckbox].activePadLock)
                setTimeout(() => {
                    setActiveCheckbox(null)
                }, 500)
        }
    }, [activeCheckbox, dataWorkDays])

    // elimina un horario o lo modifica( modificando tambien lo crea )
    const setSchedule = (startTime: any, endTime: any, statePadLock: Boolean, ind: any) => {
        const newDataWorkDays = [...dataWorkDays]
        newDataWorkDays[ind].day_start_time = startTime
        newDataWorkDays[ind].day_end_time = endTime
        newDataWorkDays[ind].activePadLock = statePadLock
        setDataWorkDays(newDataWorkDays)
    }

    // es el modal de hacer una nuevo horario o modificarlo uno ya existente
    function EditSchedule() {
        const [startTime, setStartTime] = useState(dataWorkDays[indEditSchedule].day_start_time ?? dayjs())
        const [endTime, setEndTime] = useState(dataWorkDays[indEditSchedule].day_end_time ?? dayjs())

        const CreateNewSchedule = () => {
            setSchedule(startTime, endTime, true, indEditSchedule)
            setActiveModalEditSchedule(false)
            setActiveCheckbox(null)
        }

        return (
            <>
                <Card variant='outlined' sx={{ padding: '10px', paddingTop: '15px' }}>

                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <Grid container columnSpacing={1} rowSpacing={1}>
                            <Grid item>
                                <Stack spacing={1} alignItems={'center'}>
                                    <Box>Hora de inicio</Box>
                                    <TimePicker 
                                    value={dayjs(startTime) } 
                                    onChange={(e) => setStartTime(e)} />
                                </Stack>
                            </Grid>

                            <Grid item>
                                <Stack spacing={1} alignItems={'center'}>
                                    <Box>Hora de cierre</Box>
                                    <TimePicker defaultValue={dayjs(endTime)} onChange={(e) => setEndTime(e)} />
                                </Stack>
                            </Grid>

                        </Grid>

                    </LocalizationProvider>

                    <Grid container justifyContent={'center'} marginTop={1}>

                        <Button variant='contained' sx={{ width: '90%' }} onClick={CreateNewSchedule} >Aceptar</Button>

                    </Grid>

                </Card>
            </>
        )
    }

    // Crea un modal el cual facilita q le pongas el mismo horario
    // a varios dias solo con unos clicks
    function ReplicateSchedules() {
        const [activeWeekday, setActiveWeekDay] = useState(weekDays.map(item => false))

        const setValidationSchema = (
            Yup.object({
                selectedWeekDay: Yup.string().required("Elige un dia")
            })
        )


        const onSubmit = (values: any) => {
            const newDataWorkDays = [...dataWorkDays]
            activeWeekday.forEach((item, index) => {
                if (activeWeekday[index]) {
                    newDataWorkDays[index].day_start_time = dataWorkDays[values.selectedWeekDay].day_start_time
                    newDataWorkDays[index].day_end_time = dataWorkDays[values.selectedWeekDay].day_end_time
                    newDataWorkDays[index].activePadLock = true
                }
            }
            )
            setDataWorkDays(newDataWorkDays)
            setActiveModalReplicateSchedules(false)
        }
        return (
            <>
                <Formik
                    initialValues={{ selectedWeekDay: '' }}
                    validationSchema={setValidationSchema}
                    onSubmit={onSubmit}
                >
                    {
                        (formik: any) => (

                            <Card variant='outlined' sx={{ padding: '10px' }} >
                                <form onSubmit={formik.handleSubmit}>
                                    <Stack spacing={2}>
                                        <Box>Selecciona un dia de referencia:</Box>

                                        <TextField
                                            name={'selectedWeekDay'}
                                            {...formik.getFieldProps("selectedWeekDay")}
                                            select
                                            error={formik.errors.selectedWeekDay && formik.touched.selectedWeekDay}
                                            helperText={(formik.errors.selectedWeekDay && formik.touched.selectedWeekDay) && formik.errors.selectedWeekDay}

                                        >
                                            {
                                                weekDays.map((item, index) => (
                                                    <MenuItem key={index} value={index}
                                                        onClick={(e) => {
                                                            activeWeekday[parseInt(formik.values.selectedWeekDay)] = false
                                                            activeWeekday[index] = true
                                                        }}
                                                    >{item}</MenuItem>
                                                ))
                                            }
                                        </TextField>


                                        <Box>Selecciona los dias que desees que tengan este horario:</Box>
                                        <Card variant='outlined' sx={{ padding: '5px' }} >
                                            <Grid container gap={1} flexGrow={1} justifyContent={'space-around'} >
                                                {
                                                    weekDays.map((item, index) => (
                                                        <Grid item key={index} >
                                                            <Button
                                                                size='small'
                                                                variant={!activeWeekday[index] ? 'text' : 'contained'}
                                                                onClick={() => setActiveWeekDay((e) => {
                                                                    const newActiveWeekDay = [...activeWeekday]
                                                                    newActiveWeekDay[index] = !activeWeekday[index]
                                                                    return newActiveWeekDay
                                                                })}
                                                            >{item}</Button>
                                                        </Grid>
                                                    ))
                                                }
                                            </Grid>

                                        </Card>
                                        <Button type='submit' variant='contained' >Aceptar</Button>

                                    </Stack>
                                </form>
                            </Card>


                        )
                    }

                </Formik >
            </>
        )
    }

    // animacion para q paresca q el candado esta cerrado cuando 
    // quieran seleccionar el dia
    const Vibration = {
        color: 'red',
        animation: ' vibration 0.08s linear 6 ',
        '@keyframes vibration': {
            '0%': { transform: 'translate( 2px )' },
            '100%': { transform: 'translate( -1px )' }

        }
    }

    return (
        <>
            <StoreModalDefault
                dialogTitle={"Horario de atención"}
                open={activeModalEditSchedule}
                setOpen={setActiveModalEditSchedule}
            >
                <EditSchedule />
            </StoreModalDefault>

            <StoreModalDefault
                dialogTitle={"Replicar Horarios"}
                open={activeModalReplicateSchedules}
                setOpen={setActiveModalReplicateSchedules}
            >
                <ReplicateSchedules />
            </StoreModalDefault>

            <Stack spacing={1}>
                <Box sx={{ fontWeight: 600 }}>
                    Horarios de trabajo:
                </Box>

                <Grid container >
                    {
                        activeCheckbox !== null && dataWorkDays[activeCheckbox ?? 0].activePadLock
                            ?
                            (
                                <Grid item>
                                    <Button
                                        size='small'
                                        variant='contained'
                                        onClick={() => {
                                            setActiveModalEditSchedule(true)
                                            setIndEditSchedule(activeCheckbox ?? 0)
                                        }}
                                    >Modificar Horario</Button>
                                </Grid>
                            )
                            :
                            (
                                <Grid item >
                                    <Button size='small' variant='contained'
                                        onClick={() => setActiveModalReplicateSchedules(true)}
                                    >Replicar horario</Button>
                                </Grid>
                            )
                    }

                </Grid>

                <Box>
                    {
                        weekDays.map((item: any, index: any) => (
                            <Grid container alignItems={'center'} key={index} >

                                <Grid item>
                                    <Checkbox
                                        size='small'
                                        checked={activeCheckbox === index ? dataWorkDays[index].activePadLock : false}
                                        onClick={() => setActiveCheckbox(activeCheckbox === index ? null : index)}
                                    />
                                </Grid>

                                <Grid item paddingRight={1} sx={{ fontWeight: 600 }}>
                                    {`${item}:`}
                                </Grid>

                                <Grid item >
                                    {
                                        dataWorkDays[index]?.activePadLock
                                            ? `De ${dayjs(dataWorkDays[index].day_start_time).format("hh:mm A")} a ${dayjs(dataWorkDays[index].day_end_time).format("hh:mm A")} `
                                            : `Cerrado`
                                    }
                                </Grid>

                                <Grid item>
                                    {
                                        !dataWorkDays[index]?.activePadLock
                                            ?
                                            <IconButton
                                                onClick={() => {
                                                    setActiveModalEditSchedule(true)
                                                    setIndEditSchedule(index)
                                                }}
                                            >
                                                <LockOutlined sx={activeCheckbox === index ? Vibration : { color: "black" }} />
                                            </IconButton>
                                            :
                                            <IconButton
                                                onClick={() => setSchedule(null, null, false, index)}
                                            >
                                                <LockOpen sx={{ color: 'black' }} />
                                            </IconButton>

                                    }

                                </Grid>

                            </Grid>


                        ))
                    }
                </Box>


            </Stack>

        </>
    )
}

export default WorkDays
