import { FilterAlt, FilterAltOff } from '@mui/icons-material'
import {
    AppBar,
    Box,
    Button,
    Chip,
    Dialog,
    DialogActions,
    DialogContent,
    Divider,
    Grid,
    IconButton,
    MenuItem,
    Select,
    Toolbar,
    Typography
} from '@mui/material'
import { DatePicker, DateValidationError, LocalizationProvider, PickerChangeHandlerContext, esES } from '@mui/x-date-pickers'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { DemoContainer } from '@mui/x-date-pickers/internals/demo'
import { stores } from '@prisma/client'
import dayjs, { Dayjs } from 'dayjs'
import { CloseIcon } from 'next/dist/client/components/react-dev-overlay/internal/icons/CloseIcon'
import React, { useEffect, useState } from 'react'

interface FilterStores extends stores {
    selected: boolean
}

interface ModalFilterProps {
    dialogTitle: string,
    open: boolean,
    setOpen: (bool: boolean) => void
    filterByStatus: number[]
    filterByDate: string | undefined
    filterByStores: number[]
    allStores: FilterStores[] | []
    data: any
    cleanFilters: () => void
    updateFilters: (status: number[], date: string | undefined, stores: number[]) => void
}



interface statusProps {
    id: number
    name: string
    active: boolean
}

export default function ModalFilter({ open, setOpen, dialogTitle, filterByStatus, filterByStores, filterByDate, allStores, data, cleanFilters, updateFilters }: ModalFilterProps) {

    const [status, setStatus] = useState<statusProps[] | []>([])
    const [selectedStores, setSelectedStores] = useState<FilterStores[]>([])
    const [allDates, setAllDates] = useState<string[]>([])

    //selected
    const [selectedDate, setSelectedDate] = useState<string | undefined>(undefined)
    const [selectedStatus, setSelectedStatus] = useState<number[]>([])

    useEffect(() => {
        const pending = filterByStatus.some((element) => element === 1)
        const accept = filterByStatus.some((element) => element === 2)
        const cancel = filterByStatus.some((element) => element === 3)

        const newStatus = [
            {
                id: 1,
                name: 'Pendiente',
                active: pending
            },
            {
                id: 2,
                name: 'Aceptada',
                active: accept
            },
            {
                id: 3,
                name: 'Cancelada',
                active: cancel
            }
        ]

        setStatus(newStatus)
    }, [filterByStatus])

    useEffect(() => {
        let indexBy: { [key: number]: boolean } = {};

        filterByStores.forEach((element) => { indexBy[element] = true })

        setSelectedStores(
            allStores.filter((element) => indexBy[element.id] === true)
        )

    }, [filterByStores, allStores])

    useEffect(() => {
        setSelectedDate(filterByDate)
    }, [filterByDate])

    useEffect(() => {
        const newAllDates = data.reduce((accumulator: string[], dataDate: any) => {
            const date = dataDate[0].created_at.split('T')[0]
            accumulator.push(date)
            return accumulator
        }, [])

        setAllDates(newAllDates)

    }, [data])

    const handleClose = () => {
        setOpen(false)
    }


    const FilterStatus = () => {

        const handleClickSelectedStatus = (index: number) => {
            let newSelectedStatus = [...selectedStatus]

            let newStatus = [...status]
            newStatus[index].active = !newStatus[index].active

            newStatus[index].active
                ? newSelectedStatus.push(newStatus[index].id)
                : newSelectedStatus = newSelectedStatus.filter((element) => element !== newStatus[index].id)


            setStatus(newStatus)
            setSelectedStatus(newSelectedStatus)
        }

        return (
            <Grid item container rowSpacing={1}>
                <Grid item xs={12} marginX={'auto'}>
                    <Divider>
                        <Typography variant='inherit' fontSize={19}>
                            Estados
                        </Typography>
                    </Divider>
                </Grid>
                <Grid item container justifyContent={'space-around'} rowGap={1}>
                    {
                        status.map((element, index: number) => (
                            <Grid key={index} item >
                                <Box component={'div'} onClick={() => handleClickSelectedStatus(index)}>
                                    <Chip
                                        variant={element.active ? 'filled' : 'outlined'}
                                        label={element.name}
                                        size='medium'
                                        sx={{ cursor: 'pointer' }}
                                        color={'primary'}
                                    />
                                </Box>

                            </Grid>
                        ))
                    }
                </Grid>
            </Grid>
        )
    }

    const FilterDate = () => {
        const getMonth = (month: number) => { if (month < 9) return `0${month + 1}`; return month + 1 }
        const getDate = (date: number) => { if (date < 10) return `0${date}`; return date }

        const hasSell = (date: Dayjs): boolean => {
            const dateToCompare: string = `${date.get("year")}-${getMonth(date.get('month'))}-${getDate(date.get('date'))}`;
            return !allDates?.includes(dateToCompare);
        }

        const handleChange = (value: unknown, context: PickerChangeHandlerContext<DateValidationError>) => {
            if (value === null) { setSelectedDate(undefined); return }
            const date = value as Dayjs;
            const newSelectedDate = `${date.get("year")}-${getMonth(date.get('month'))}-${getDate(date.get('date'))}`
            setSelectedDate(newSelectedDate);
        }
        return (
            <Grid item container rowSpacing={1}>
                <Grid item xs={12} marginX={'auto'}>
                    <Divider>
                        <Typography variant='inherit' fontSize={19}>
                            Fecha
                        </Typography>
                    </Divider>
                </Grid>
                <Grid item xs={12} >
                    <LocalizationProvider
                        dateAdapter={AdapterDayjs}
                        localeText={esES.components.MuiLocalizationProvider.defaultProps.localeText}
                        adapterLocale='es'>
                        <DemoContainer components={['DatePicker']}>
                            <DatePicker
                                disabled={allStores?.length! > 0 ? false : true}
                                value={selectedDate ? dayjs(selectedDate) : null}
                                slotProps={{ field: { clearable: true }, toolbar: { hidden: true }, textField: { size: 'small', fullWidth: true } }}
                                label="Seleccione una fecha" disableFuture shouldDisableDate={hasSell} onChange={handleChange} />
                        </DemoContainer>
                    </LocalizationProvider>
                </Grid>
            </Grid>
        )
    }

    const FilterStore = () => {

        const handleSelectStore = (e: any) => {
            setSelectedStores(e.target.value)
        }

        const ITEM_HEIGHT = 48
        const ITEM_PADDING_TOP = 8
        const MenuProps = {
            PaperProps: {
                style: {
                    maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
                    width: 250,
                },
            },
        }
        return (
            <Grid item container rowSpacing={1}>
                <Grid item xs={12} marginX={'auto'}>
                    <Divider>
                        <Typography variant='inherit' fontSize={19}>
                            Tiendas
                        </Typography>
                    </Divider>
                </Grid>
                <Grid item container justifyContent={'space-between'}>
                    <Select
                        id="selectedStores"
                        name="selectedStores"
                        fullWidth
                        multiple
                        size={"small"}
                        value={selectedStores}
                        onChange={handleSelectStore}
                        MenuProps={MenuProps}
                        renderValue={(selected: any) => (
                            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                                {
                                    selected.map((item: any) => (
                                        <Chip
                                            key={item.id}
                                            label={item.name}
                                            variant='outlined'
                                            size={"small"}
                                        />
                                    ))
                                }
                            </Box>
                        )}
                    >
                        {
                            allStores.map((element: any, index: any) => (
                                <MenuItem key={index} value={element}>{element.name}</MenuItem>
                            ))
                        }
                    </Select>
                </Grid>
            </Grid>
        )
    }
    const ShowFilters = () => {
        return (
            <>
                <Grid container rowGap={3}  >
                    <FilterStatus />
                    <FilterDate />
                    <FilterStore />
                </Grid>
            </>
        )
    }

    const handleClickFilter = () => {
        const storesId = selectedStores.map((element) => element.id)
        updateFilters(selectedStatus, selectedDate, storesId)
    }


    return (
        <>
            <Dialog open={open} onClose={handleClose}>
                <AppBar sx={{ position: 'relative' }}>
                    <Toolbar>
                        <Typography sx={{ ml: 2, flex: 1 }} variant="h6" component="div">
                            {dialogTitle}
                        </Typography>
                        <IconButton
                            edge="start"
                            color="inherit"
                            onClick={handleClose}
                            aria-label="close"
                        >
                            <CloseIcon />
                        </IconButton>
                    </Toolbar>
                </AppBar>
                <DialogContent>
                    <ShowFilters />
                </DialogContent>
                <DialogActions>
                    <Button
                        variant={'outlined'}
                        size={'small'}
                        color='error'
                        startIcon={<FilterAltOff />}
                        onClick={cleanFilters}>
                        Limpiar
                    </Button>
                    <Button
                        variant={'outlined'}
                        size={'small'}
                        startIcon={<FilterAlt />}
                        onClick={handleClickFilter}
                    >
                        Filtrar
                    </Button>
                </DialogActions>
            </Dialog>

        </>
    )
}
