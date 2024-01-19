'use client'

import {
    AppBar, Box, Card, CardContent, Grid, IconButton, Table,
    TableBody, TableCell, TableContainer, TableHead, TableRow,
    Toolbar, Tooltip, Typography
} from '@mui/material';
import { DatePicker, DateValidationError, LocalizationProvider, PickerChangeHandlerContext } from '@mui/x-date-pickers';
import { ArrowLeft, ExpandLessOutlined, ExpandMoreOutlined, HelpOutline } from '@mui/icons-material';
import stores from "@/app/inventory/seller/store/[sellerStoreId]/requests/sellerStore";
import { DemoContainer } from '@mui/x-date-pickers/internals/demo';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import SellsMoreDetails from '../components/SellsMoreDetails';
import { storeSellsDetailsProps } from '@/types/interfaces';
import { TableNoData } from '@/components/TableNoData';
import InfoTooltip from '@/components/InfoTooltip';
import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useRouter } from "next/navigation";
import dayjs, { Dayjs } from 'dayjs';
import 'dayjs/locale/es';

const getMonth = (month: number) => { if (month < 9) return `0${month + 1}`; return month + 1 }
const getDate = (date: number) => { if (date < 10) return `0${date}`; return date }

const SellsHistory = () => {
    const params = useParams();
    const router = useRouter();
    const sellerStoreId = +params.sellerStoreId!;

    const [allSells, setAllSells] = useState<storeSellsDetailsProps[] | null>(null);
    const [sellDates, setSellDates] = useState<string[] | null>(null);

    const [selectedDate, setSelectedDate] = useState<string>();

    const handleChange = (value: unknown, context: PickerChangeHandlerContext<DateValidationError>) => {
        if (value === null) { setSelectedDate(undefined); return }
        const date = value as Dayjs;
        const selectedDate = `${date.get("year")}-${getMonth(date.get('month'))}-${getDate(date.get('date'))}`
        setSelectedDate(selectedDate);
    };

    //GET sell dates in spanish format, exclude duplicate and then sorts the array
    useEffect(() => {
        const sellDatesFormatted: string[] | undefined = allSells?.
            reduce((accumulator: string[], sell: storeSellsDetailsProps) => {
                const sellDate = new Date(sell.created_at);
                const isoDate = sellDate.toISOString().split('T')[0];

                // Verify current date if already added
                if (!accumulator.some((item) => item === isoDate)) {
                    accumulator.push(isoDate);
                }
                return accumulator;
            }, []);
        setSellDates(sellDatesFormatted!);
    }, [allSells]);

    useEffect(() => {
        const loadData = async () => {
            const storeAllSellsDetails: storeSellsDetailsProps[] = await stores.storeSellsDetails(sellerStoreId, true);
            setAllSells(storeAllSellsDetails);
        }
        loadData();
    }, [sellerStoreId]);

    const handleNavigateBack = () => router.back();

    const [showDetails, setShowDetails] = useState<number>(-1);

    const [isOpenTooltip, setIsOpenTooltip] = useState<boolean>(false);
    const handleTooltipClose = () => setIsOpenTooltip(false);
    const handleTooltipOpen = () => setIsOpenTooltip(true);

    const hasSell = (date: Dayjs): boolean => {
        const dateToCompare: string = `${date.get("year")}-${getMonth(date.get('month'))}-${getDate(date.get('date'))}`;
        if (sellDates) {
            return !sellDates?.includes(dateToCompare);
        }
        return true;
    }

    const CustomToolbar = () => (
        <AppBar position={"static"} variant={"elevation"} color={"primary"}>
            <Toolbar sx={{ display: "flex", justifyContent: "space-between", color: "white" }}>
                <Box sx={{ display: "flex", alignItems: "center", overflowX: "auto" }}>
                    <IconButton color={"inherit"} sx={{ mr: "10px" }} onClick={handleNavigateBack}>
                        <ArrowLeft fontSize={"large"} />
                    </IconButton>
                    <Typography
                        variant="h6"
                        noWrap
                        sx={{
                            fontWeight: 700,
                            color: "white",
                        }}
                    >
                        Historial de ventas
                    </Typography>
                </Box>
            </Toolbar>
        </AppBar>
    )

    const TableHeader = () => {
        return (
            <TableHead>
                <TableRow>
                    <TableCell id='details' />
                    <TableCell align='center' id='total_price' sx={{ whiteSpace: "nowrap" }}>Total recaudado</TableCell>
                    <TableCell align='center' id='payment_method' sx={{ whiteSpace: "nowrap" }}>Forma de pago</TableCell>
                    <TableCell id='sell_products_quantity'>Productos</TableCell>
                    <TableCell id='created_at'>Registrado</TableCell>
                    <TableCell align='center' id='sell_type' sx={{ whiteSpace: "nowrap" }}>Tipo de venta</TableCell>
                    <TableCell id='units_returned_quantity'>Devoluciones</TableCell>
                </TableRow>
            </TableHead>
        )
    }

    const TableContent = () => {
        let filteredSells: storeSellsDetailsProps[] | null | undefined = [];
        if (selectedDate) {
            filteredSells = allSells?.filter(
                (sell: storeSellsDetailsProps) => {
                    const splitDate = (date: Date | string) => {
                        return new Date(date).toISOString().split('T')[0];
                    };
                    if (splitDate(sell.created_at) === splitDate(selectedDate)) return sell
                });
        } else {
            filteredSells = allSells;
        }
        return (
            <TableBody>
                {filteredSells?.map(
                    (sell: storeSellsDetailsProps) => (
                        <React.Fragment key={sell.id}>
                            <TableRow
                                key={sell.id}
                                hover
                                tabIndex={-1}
                            >
                                <TableCell>
                                    <Tooltip title={"Detalles"}>
                                        <IconButton
                                            size={"small"}
                                            onClick={() => setShowDetails((showDetails !== sell.id) ? sell.id : -1)}
                                        >
                                            {
                                                (showDetails !== sell.id)
                                                    ? <ExpandMoreOutlined />
                                                    : <ExpandLessOutlined />
                                            }
                                        </IconButton>
                                    </Tooltip>
                                </TableCell>
                                <TableCell align='center'>{sell.total_price}</TableCell>
                                <TableCell align='center'>{sell.payment_method}</TableCell>
                                <TableCell align='center'>{sell.sell_products.length!}</TableCell>
                                <TableCell align='center'>{dayjs(sell.created_at).format('h:mm A')}</TableCell>
                                <TableCell align='center'>{sell.reservations !== null ? "Reservación" : "Presencial"}</TableCell>
                                <TableCell align='center'>{sell.units_returned_quantity ? sell.units_returned_quantity : "-"}</TableCell>
                            </TableRow>
                            <TableRow >
                                <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={12}>
                                    {showDetails === sell.id && (
                                        <SellsMoreDetails
                                            show={(showDetails === sell.id)}
                                            sell_products={sell.sell_products}
                                        />
                                    )}
                                </TableCell>
                            </TableRow>
                        </React.Fragment>
                    ))}
            </TableBody>
        )
    }

    return (
        <Card variant={"outlined"}>
            <CustomToolbar />
            <CardContent>
                <Card variant={"outlined"} sx={{ padding: "10px", marginBottom: "10px" }}>
                    <Grid item container alignItems="center" justifyContent="center" sx={{ marginTop: "-10px" }}>
                        <Grid container item xs={"auto"} alignItems={"center"} >
                            <Typography variant="subtitle1" sx={{ fontWeight: "400" }}>Búsqueda avanzada</Typography>
                        </Grid>
                        <Grid container item xs={"auto"} alignItems={"center"}>
                            <InfoTooltip
                                isOpenTooltip={isOpenTooltip}
                                handleTooltipClose={handleTooltipClose}
                                message={"Puede buscar por fecha de venta"}
                            >
                                <IconButton onClick={handleTooltipOpen}>
                                    <HelpOutline />
                                </IconButton>
                            </InfoTooltip>
                        </Grid>
                    </Grid>
                    <Grid item xs={12} mx={"40px"}>
                        <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale='es'>
                            <DemoContainer components={['DatePicker']}>
                                <DatePicker
                                    slotProps={{ field: { clearable: true } }}
                                    label="Seleccione una fecha" disableFuture shouldDisableDate={hasSell} onChange={handleChange} />
                            </DemoContainer>
                        </LocalizationProvider>
                    </Grid>
                </Card>
                <Card variant={"outlined"} sx={{ paddingTop: "20px", mx: "-5px" }}>
                    <Grid container rowSpacing={2}>
                        {
                            allSells?.length! > 0 ?
                                (<TableContainer sx={{ width: "100%", maxHeight: "70vh", overflowX: "auto" }}>
                                    <Table sx={{ width: "100%" }} size={"small"}>
                                        <TableHeader />
                                        <TableContent />
                                    </Table>
                                </TableContainer>) :
                                <TableNoData hasData={allSells?.length!} />
                        }
                    </Grid>
                </Card>
            </CardContent>
        </Card >
    )
}

export default SellsHistory