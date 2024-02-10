'use client'

import {
    AppBar, Box, Card, CardContent, Chip, Grid, IconButton, Table,
    TableBody, TableCell, TableContainer, TableHead, TableRow,
    Toolbar, Tooltip, Typography
} from '@mui/material';
import { DatePicker, DateValidationError, LocalizationProvider, PickerChangeHandlerContext } from '@mui/x-date-pickers';
import { AddOutlined, ArrowLeft, Check, CheckOutlined, Close, ExpandLessOutlined, ExpandMoreOutlined, HelpOutline } from '@mui/icons-material';
import stores from "@/app/inventory/seller/store/[sellerStoreId]/requests/sellerStore";
import calcSellReceivableProductsUnits from '@/utils/calcSellReceivableProductsUnits';
import { storeSellsReceivableDetailsProps } from '@/types/interfaces';
import { DemoContainer } from '@mui/x-date-pickers/internals/demo';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { TableNoData } from '@/components/TableNoData';
import InfoTooltip from '@/components/InfoTooltip';
import React, { useEffect, useState } from 'react';
import { esES } from '@mui/x-date-pickers/locales'
import { useParams } from 'next/navigation';
import { useRouter } from "next/navigation";
import dayjs, { Dayjs } from 'dayjs';
import 'dayjs/locale/es';
import { getColorByStatus } from '@/utils/getColorByStatus';
import SellsReceivableMoreDetails from '../components/SellsReceivableMoreDetails';

dayjs.locale("es");

const getMonth = (month: number) => { if (month < 9) return `0${month + 1}`; return month + 1 }
const getDate = (date: number) => { if (date < 10) return `0${date}`; return date }

const SellsReceivableHistory = () => {
    const params = useParams();
    const router = useRouter();
    const sellerStoreId = +params.sellerStoreId!;

    const [allSellsReceivable, setAllSellsReceivable] = useState<storeSellsReceivableDetailsProps[] | null>(null);
    const [sellReceivableDates, setSellReceivableDates] = useState<string[] | null>(null);
    const [sellReceivablePayBeforeDates, setSellReceivablePayBeforeDates] = useState<string[] | null>(null);

    const [selectedDate, setSelectedDate] = useState<string>();

    const handleChange = (value: unknown, context: PickerChangeHandlerContext<DateValidationError>) => {
        if (value === null) { setSelectedDate(undefined); return }
        const date = value as Dayjs;
        const selectedDate = `${date.get("year")}-${getMonth(date.get('month'))}-${getDate(date.get('date'))}`
        setSelectedDate(selectedDate);
    };

    //GET sell dates in spanish format, exclude duplicate and then sorts the array
    useEffect(() => {
        const sellReceivableDatesFormatted: string[] | undefined = allSellsReceivable?.
            reduce((accumulator: string[], sell: storeSellsReceivableDetailsProps) => {
                const sellReceivableDate = new Date(sell.created_at);
                const isoDate = sellReceivableDate.toISOString().split('T')[0];

                // Verify current date if already added
                if (!accumulator.some((item) => item === isoDate)) {
                    accumulator.push(isoDate);
                }
                return accumulator;
            }, []);
        setSellReceivableDates(sellReceivableDatesFormatted!);
    }, [allSellsReceivable]);


    const refreshData = async () => {
        const storeAllSellsReceivableDetails: storeSellsReceivableDetailsProps[] = await stores.getSellsReceivable(sellerStoreId);
        setAllSellsReceivable(storeAllSellsReceivableDetails);
    }

    const handlePaySell = async (sellId: number) => {
        const paidSell = await stores.payOrCancelSellReceivable(sellId, "confirm");
        console.log('paid', paidSell);
        refreshData();
    }

    const handleCancelSell = async (sellId: number) => {
        const canceledSell = await stores.payOrCancelSellReceivable(sellId, "cancel");
        console.log("canceled", canceledSell);
        refreshData();
    }

    useEffect(() => {
        const loadData = async () => {
            const storeAllSellsReceivableDetails: storeSellsReceivableDetailsProps[] = await stores.getSellsReceivable(sellerStoreId);
            setAllSellsReceivable(storeAllSellsReceivableDetails);
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
        if (sellReceivableDates) {
            return !sellReceivableDates?.includes(dateToCompare);
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
                        Historial de ventas por cobrar
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
                    <TableCell align='center' id='status'>Estado</TableCell>
                    <TableCell align='center' id='total_price_payment_method'>Importe total</TableCell>
                    <TableCell align='center' id='sell_products_quantity'>Productos</TableCell>
                    <TableCell align='center' id='units'>Unidades</TableCell>
                    <TableCell align='center' id='created_at'>Registrado</TableCell>
                </TableRow>
            </TableHead>
        )
    }

    const TableContent = () => {
        let filteredSells: storeSellsReceivableDetailsProps[] | null | undefined = [];
        if (selectedDate) {
            filteredSells = allSellsReceivable?.filter(
                (sell: storeSellsReceivableDetailsProps) => {
                    const splitDate = (date: Date | string) => {
                        if (date instanceof Date) {
                            return new Date(date).toISOString().split('T')[0];
                        } else {
                            const normalizeDate = new Date(date);
                            if (isNaN(normalizeDate.getTime())) {
                                return '';
                            } else {
                                return normalizeDate.toISOString().split('T')[0];
                            }
                        }
                    };
                    if (splitDate(sell.created_at) === splitDate(selectedDate)) return sell
                });
        } else {
            filteredSells = allSellsReceivable;
        }

        return (
            <TableBody>
                {filteredSells?.map(
                    (sell: storeSellsReceivableDetailsProps) => (
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
                                <TableCell align='center'>
                                    <Grid item container>
                                        <Grid item>
                                            <Chip
                                                size={"small"}
                                                label={sell.status}
                                                color={getColorByStatus(sell.status)}
                                                sx={{ border: "1px solid lightGreen" }}
                                            />
                                        </Grid>
                                    </Grid>
                                    {sell.status === "PENDIENTE" &&
                                        <Grid item container justifyContent={"center"}>
                                            <Grid item><IconButton onClick={() => { handlePaySell(sell.id) }}><Check color='success' /></IconButton></Grid>
                                            <Grid item><IconButton onClick={() => { handleCancelSell(sell.id) }}><Close color='error' /></IconButton></Grid>
                                        </Grid>
                                    }
                                </TableCell>
                                <TableCell align='center'>{sell.total_price} <br /> {sell.payment_method}</TableCell>
                                <TableCell align='center'>{sell.sell_receivable_products.length! !== 1 ? sell.sell_receivable_products.length! : sell.sell_receivable_products[0].store_depots.depots?.products?.name}</TableCell>
                                <TableCell align='center'>{`${calcSellReceivableProductsUnits(sell)}`}</TableCell>
                                <TableCell align='center'>{dayjs(sell.created_at).format('MMM D, YYYY')} <br /> {dayjs(sell.created_at).format('h:mm A')}</TableCell>
                            </TableRow>
                            <TableRow >
                                <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={12}>
                                    {showDetails === sell.id && (
                                        <SellsReceivableMoreDetails
                                            show={(showDetails === sell.id)}
                                            sell_receivable_products={sell.sell_receivable_products!}
                                            history
                                            refreshData={refreshData}
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
                        <LocalizationProvider
                            dateAdapter={AdapterDayjs}
                            localeText={esES.components.MuiLocalizationProvider.defaultProps.localeText}
                            adapterLocale='es'>
                            <DemoContainer components={['DatePicker']}>
                                <DatePicker
                                    disabled={sellReceivableDates?.length! > 0 ? false : true}
                                    slotProps={{ field: { clearable: true }, toolbar: { hidden: true } }}
                                    label="Seleccione una fecha" disableFuture shouldDisableDate={hasSell} onChange={handleChange} />
                            </DemoContainer>
                        </LocalizationProvider>
                    </Grid>
                </Card>
                <Card variant={"outlined"} sx={{ paddingTop: "20px", mx: "-5px" }}>
                    <Grid container rowSpacing={2}>
                        {
                            allSellsReceivable?.length! > 0 && selectedDate ?
                                (allSellsReceivable?.filter(
                                    (sell: storeSellsReceivableDetailsProps) => {
                                        const splitDate = (date: Date | string) => {
                                            if (date instanceof Date) {
                                                return new Date(date).toISOString().split('T')[0];
                                            } else {
                                                const normalizeDate = new Date(date);
                                                if (isNaN(normalizeDate.getTime())) {
                                                    return '';
                                                } else {
                                                    return normalizeDate.toISOString().split('T')[0];
                                                }
                                            }
                                        };
                                        if (splitDate(sell.created_at) === splitDate(selectedDate!)) return sell
                                    }).length! > 0) ?
                                    (<TableContainer sx={{ width: "100%", maxHeight: "70vh", overflowX: "auto" }}>
                                        <Table sx={{ width: "100%" }} size={"small"}>
                                            <TableHeader />
                                            <TableContent />
                                        </Table>
                                    </TableContainer>) :
                                    <TableNoData searchCoincidence />
                                : allSellsReceivable?.length! > 0 ?
                                    (<TableContainer sx={{ width: "100%", maxHeight: "70vh", overflowX: "auto" }}>
                                        <Table sx={{ width: "100%" }} size={"small"}>
                                            <TableHeader />
                                            <TableContent />
                                        </Table>
                                    </TableContainer>)
                                    :
                                    <TableNoData hasData={allSellsReceivable?.length!} />
                        }
                    </Grid>
                </Card>
            </CardContent>
        </Card >
    )
}

export default SellsReceivableHistory