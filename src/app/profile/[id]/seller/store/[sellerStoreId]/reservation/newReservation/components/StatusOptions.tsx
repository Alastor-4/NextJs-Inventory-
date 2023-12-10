import { Button, Grid, MenuItem, TextField } from '@mui/material'
import React, { useEffect, useState } from 'react'
import { reservation } from '../request/reservation'
import { notifyError, notifySuccess } from '@/utils/generalFunctions'
import { useParams } from 'next/navigation'


function StatusOptions({ codeId, indUpdate, dataReservation, getData, setOpen }: { codeId: number, indUpdate: number, dataReservation: any, getData: any, setOpen: any }) {

    const params = useParams()

    const [selectedState, setSelectedState] = useState<any>(codeId)

    const nameStates = ['Pendiente', 'Cancelada', 'Reservado', 'Vendido', 'En camino', 'Entregado']


    const changeStatus = async () => {
        const data = {
            id: dataReservation[indUpdate].id,
            payment_method: dataReservation[indUpdate].payment_method,
            requesting_user_id: dataReservation[indUpdate].requesting_user_id,
            request_delivery: dataReservation[indUpdate].request_delivery,
            delivery_notes: dataReservation[indUpdate].delivery_notes,
            status_description: dataReservation[indUpdate].status_description,
            status_id: selectedState,
            total_price: dataReservation[indUpdate].total_price,

        }

        const request = await reservation.updateReservation(params.id, params.sellerStoreId, data)

        if (request === 200) {
            getData()

            notifySuccess("El estado de la reservación ha cambiado")
        } else {
            notifyError("Hubo un error al cambiar el estado de la reservación")
        }
    }

    return (
        <>
            <Grid container spacing={2}>
                <Grid item sx={{ width: "100%" }}>
                    <TextField
                        name={"selectedState"}
                        fullWidth
                        size='small'
                        select
                        value={selectedState}
                        onChange={(e) => setSelectedState(parseInt(e.target.value))}
                    >
                        {
                            nameStates.map((element: any, index: any) => (
                                <MenuItem key={index} value={index + 1} >{element}</MenuItem>
                            ))
                        }

                    </TextField >
                </Grid>
                <Grid item container columnGap={2} justifyContent={'flex-end'}>
                    <Grid item>
                        <Button
                            variant='outlined'
                            color={'secondary'}
                            onClick={() => setOpen(false)}
                        >
                            Cancelar
                        </Button>
                    </Grid>

                    <Grid item>
                        <Button
                            variant='outlined'
                            color='primary'
                            onClick={() => changeStatus()}
                        >
                            Aceptar
                        </Button>
                    </Grid>

                </Grid>
            </Grid>


        </>
    )
}

export default StatusOptions
