import { LockOpen, LockOutlined } from '@mui/icons-material'
import { Box, Button, Card, Checkbox, CircularProgress, Grid, IconButton, MenuItem, Stack, TextField, Zoom } from '@mui/material'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import React, { useState, useEffect } from 'react'
import StoreModalDefault from '../app/profile/[id]/store-details/[storeDetailsId]/components/Modal/StoreModalDefault'
import dayjs from 'dayjs';
import { TimePicker } from '@mui/x-date-pickers';
import { Formik } from 'formik';
import * as Yup from 'yup'
import { openDaysStores } from '../request/openDaysStores';

type objectStoreOpenDay = {
    id: number | null,
    week_day_number: number,
    day_start_time: Date | null,
    day_end_time: Date | null,
    store_id: number
}

type closeOrOpen = {
    activePadLock: boolean
}

type objectStoreDay = objectStoreOpenDay & closeOrOpen

function WorkDays(props: any) {
    const { urlApi, setFatherData, storeId, title } = props;

    // Es el indicador para saber si quieres q el componente actualize la bd
    //en timepo real o q solo devuelva los valores modificados sin afectar a la bd
    const changeRealTime: boolean = (setFatherData === null)

    const [dataStoreDays, setDataStoreDays] = useState<Array<objectStoreDay>>([]);

    // Carga los datos desde la bd si la tienda a la que se le
    //van a modificar los horarios existe sino los pone por defecto en Cerrado
    useEffect(() => {

        const getData = async () => {

            if (dataStoreDays.length === 0) {
                let newDataStoreDays: objectStoreDay[] = [];

                for (let i = 0; i < 7; i++) {
                    newDataStoreDays.push({
                        id: null,
                        week_day_number: i,
                        day_start_time: null,
                        day_end_time: null,
                        store_id: storeId,
                        activePadLock: false
                    })
                }

                if (storeId !== null) {

                    const data = await openDaysStores.getDataStoreDay(urlApi, storeId)

                    data.forEach((element: objectStoreOpenDay) => {
                        newDataStoreDays[element.week_day_number] = { ...element, activePadLock: true }

                    });
                }

                setDataStoreDays(newDataStoreDays);
                if (!changeRealTime) setFatherData(newDataStoreDays)
            }
        }
        getData();

    }, [dataStoreDays, storeId])

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
            if (!dataStoreDays[activeCheckbox].activePadLock)
                setTimeout(() => {
                    setActiveCheckbox(null)
                }, 500)
        }
    }, [activeCheckbox, dataStoreDays])

    // Actualiza la bd segun el cambio q se haya realizado
    const updateDbData = async (selectedDataDay: objectStoreDay) => {

        const item = selectedDataDay;

        let openDaysResponse;

        if (item.id !== null) {
            item.activePadLock
                ? openDaysResponse = await openDaysStores.update(urlApi, item)
                : openDaysResponse = await openDaysStores.delete(urlApi, item.id)
        } else
            if (item.activePadLock)
                openDaysResponse = await openDaysStores.create(urlApi, item)
    }

    // Actualiza los datos del dia seleccionado:
    // si los cambios en tiempo real esta en true( cahngeRelTime )
    // sino actualiza manda los datos al padre
    const setSchedule = (startTime: any, endTime: any, statePadLock: boolean, ind: any) => {
        const newDataStoreDays = [...dataStoreDays]
        newDataStoreDays[ind].day_start_time = startTime
        newDataStoreDays[ind].day_end_time = endTime
        newDataStoreDays[ind].activePadLock = statePadLock

        if (changeRealTime) {
            updateDbData(newDataStoreDays[ind])
            setDataStoreDays([]);
        } else {
            setFatherData(newDataStoreDays)
            setDataStoreDays(newDataStoreDays)
        }
    }

    // es el modal de hacer una nuevo horario o modificarlo uno ya existente
    function EditSchedule() {

        const [startTime, setStartTime] = useState<any>(dataStoreDays[indEditSchedule]?.day_start_time ?? dayjs())
        const [endTime, setEndTime] = useState<any>(dataStoreDays[indEditSchedule]?.day_end_time ?? dayjs())

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
                                        value={dayjs(startTime)}
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
            const newDataStoreDays = [...dataStoreDays]

            activeWeekday.forEach(async (item, index) => {
                if (item) {
                    newDataStoreDays[index].day_start_time = dataStoreDays[values.selectedWeekDay].day_start_time
                    newDataStoreDays[index].day_end_time = dataStoreDays[values.selectedWeekDay].day_end_time
                    newDataStoreDays[index].activePadLock = dataStoreDays[values.selectedWeekDay].activePadLock
                }
                if (changeRealTime) await updateDbData(newDataStoreDays[index])
            }
            )

            if (changeRealTime) {
                setDataStoreDays([]);
            } else {
                setFatherData(newDataStoreDays)
                setDataStoreDays(newDataStoreDays)
            }
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
                                                    >{
                                                            `${item} ${!dataStoreDays[index]?.activePadLock
                                                                ? "Cerrado"
                                                                : `${dayjs(dataStoreDays[index].day_start_time).format("hh:mm A")} - ${dayjs(dataStoreDays[index].day_end_time).format("hh:mm A")}`}`

                                                        }</MenuItem>
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
            {
                dataStoreDays.length === 0
                    ? <CircularProgress size={24} color={"inherit"} />
                    : (
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
                                    {title}
                                </Box>

                                <Grid container >
                                    {
                                        activeCheckbox !== null && dataStoreDays[activeCheckbox ?? 0].activePadLock
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
                                                    <Button
                                                        size='small'
                                                        variant='contained'
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
                                                        checked={activeCheckbox === index ? dataStoreDays[index].activePadLock : (false as boolean)}
                                                        onClick={() => setActiveCheckbox(activeCheckbox === index ? null : index)}
                                                    />
                                                </Grid>

                                                <Grid item paddingRight={1} sx={{ fontWeight: 600 }}>
                                                    {`${item}:`}
                                                </Grid>

                                                <Grid item >
                                                    {
                                                        dataStoreDays[index]?.activePadLock
                                                            ? `De ${dayjs(dataStoreDays[index].day_start_time).format("hh:mm A")} a ${dayjs(dataStoreDays[index].day_end_time).format("hh:mm A")} `
                                                            : `Cerrado`
                                                    }
                                                </Grid>

                                                <Grid item>
                                                    {
                                                        !dataStoreDays[index]?.activePadLock
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


        </>
    )
}

export default WorkDays
