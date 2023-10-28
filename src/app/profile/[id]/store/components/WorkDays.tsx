import { LockOpen, LockOutlined } from '@mui/icons-material'
import { Box, Button, Checkbox, Grid, IconButton, Stack, Zoom } from '@mui/material'
import { keyframes } from '@emotion/react'
import React, { useState } from 'react'
import StoreModalDefault from '../../store-details/[storeDetailsId]/components/Modal/StoreModalDefault'

function WorkDays( props : any) {
    
    const { dataWorkDays, setDataWorkDays } = props

    const weekDays = ['Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo',]
   
    const [activeCheckbox, setActiveCheckbox] = useState< number | null  >()
    const [activeModalSchedule, setActiveModalSchedule] = useState(false)
    
    const changePadLock = ( ind : number ) =>{

        /*const newDataWorkDays = [...dataWorkDays]
        newDataWorkDays[ind].activePadLock = !newDataWorkDays[ind].activePadLock
        setDataWorkDays(newDataWorkDays)*/
    }

    
    return (
        <>
            <StoreModalDefault
                dialogTitle={"Abrir Tienda"}
                open={activeModalSchedule}
                setOpen={setActiveModalSchedule}
            >
                
            </StoreModalDefault>

            <Stack spacing={1}>
                <Box sx={{ fontWeight: 600 }}>
                    Horarios de trabajo:
                </Box>

                <Grid container >

                    <Grid item paddingRight={1} >
                        <Button size='small' variant='contained'>Replicar horario</Button>
                    </Grid>

                    <Grid item>
                        <Button size='small' variant='contained'>Modificar Horario</Button>
                    </Grid>
                </Grid>

                <Box>
                    {
                        weekDays.map((item, index) => (
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
                                    Cerrado
                                </Grid>

                                <Grid item>
                                    <IconButton onClick={ () => changePadLock(index) }>
                                        {
                                            !dataWorkDays[index]?.activePadLock
                                                ? <LockOutlined  sx={{ color: 'black' }}/>
                                                : <LockOpen sx={{ color: 'black' }} />

                                        }
                                    </IconButton>
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
