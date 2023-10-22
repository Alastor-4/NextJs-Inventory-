// @ts-nocheck
import {EditOutlined, ExpandLessOutlined, ExpandMoreOutlined, VisibilityOutlined} from '@mui/icons-material'
import {Box, Collapse, Grid, IconButton, Switch, Typography} from '@mui/material'
import React, {useEffect, useState} from 'react'
import StoreListOffers from './StoreListOffers'
import StoreEditSellerProfit
    from '@/app/profile/[id]/store-details/[storeDetailsId]/components/Modal/StoreEditSellerProfit'
import StoreModalDetails from './Modal/StoreModalDetails'
import ImagesDisplayDialog from '@/components/ImagesDisplayDialog'
import {storeDetails} from '../request/storeDetails'

function StoreMoreDetails({userId, details, show, loadDates, row}) {


    const [showOffers, setShowOffers] = useState(false)
    const [activeModalSellerProfit, setActiveModalSellerProfit] = useState(false);

    const [openImageDialog, setOpenImageDialog] = useState(false);
    const [dialogImages, setDialogImages] = useState([])
    const [isActive, setIsActive] = useState(details.is_active);


    useEffect(() => {
        const updateIsActive = async () => {
            const data = {
                id: details.id,
                store_id: details.store_id,
                depot_id: details.depot_id,
                product_units: details.product_units,
                product_remaining_units: details.product_remaining_units,
                seller_profit_percentage: details.seller_profit_percentage,
                is_active: isActive,
                offer_notes: details.offer_notes,
                sell_price: details.sell_price,
                sell_price_unit: details.sell_price_unit,
                seller_profit_quantity: details.seller_profit_quantity,
                price_discount_percentage: details.price_discount_percentage,
                price_discount_quantity: details.price_discount_quantity,
            }
            const response = await storeDetails.update(userId, details.id, data)
            if (response === 200) {
                loadDates();
                details.is_active = isActive;
            }
        }

        if (isActive !== details.is_active) {
            updateIsActive();
        }
    }, [details, isActive, loadDates, userId])

    const showSellerProfit = () => {
        const valuePercentage = (details.seller_profit_percentage) ? details.seller_profit_percentage * details.sell_price / 100 : null;
        if (valuePercentage) return `${details.seller_profit_percentage}%  (${valuePercentage} ${details.sell_price_unit})`
        return `${details.seller_profit_quantity} ${details.sell_price_unit}`
    }

    function handleOpenImagesDialog(images) {
        setDialogImages(images)
        setOpenImageDialog(true)
    }


    return (
        <>

            <StoreModalDetails
                dialogTitle={"Editar ganacia del vendedor"}
                open={activeModalSellerProfit}
                setOpen={setActiveModalSellerProfit}
            >
                <StoreEditSellerProfit
                    userId={userId}
                    storeDepot={details}
                    setActiveModalSellerProfit={setActiveModalSellerProfit}
                    loadDates={loadDates}
                />
            </StoreModalDetails>

            <ImagesDisplayDialog
                dialogTitle={"Imágenes del producto"}
                open={openImageDialog}
                setOpen={setOpenImageDialog}
                images={dialogImages}
            />

            <Collapse in={show} timeout="auto" unmountOnExit>
                <Grid container spacing={1} sx={{padding: "8px 26px"}}>
                    <Grid item xs={12}>
                        <Typography variant="subtitle1" gutterBottom component="div">
                            Detalles:
                        </Typography>
                    </Grid>


                    <Grid container item spacing={1} xs={12}>
                        <Grid item xs={"auto"} sx={{fontWeight: 600}}>Producto:</Grid>
                        <Grid item xs={true}>
                            {row.name}
                            {
                                row.description && (
                                    <small>
                                        {` ${row.description}`}
                                    </small>
                                )
                            }
                        </Grid>
                    </Grid>


                    <Grid container item spacing={1} xs={12}>
                        <Grid item xs={"auto"} sx={{fontWeight: 600}}>Departamento:</Grid>
                        <Grid item xs={true}>{row.departments?.name ?? "-"}</Grid>
                    </Grid>


                    <Grid container item spacing={1} xs={12}>
                        <Grid item xs={"auto"}
                              sx={{fontWeight: 600, display: "flex", alignItems: "center"}}>Características:</Grid>
                        <Grid item xs={true} sx={{display: "flex", alignItems: "center"}}>
                            {row.characteristics.length > 0
                                ? row.characteristics.map(item => (
                                        <Grid
                                            key={item.id}
                                            sx={{
                                                display: "inline-flex",
                                                margin: "3px",
                                                backgroundColor: "rgba(170, 170, 170, 0.8)",
                                                padding: "2px 4px",
                                                borderRadius: "5px 2px 2px 2px",
                                                border: "1px solid rgba(130, 130, 130)",
                                                fontSize: 14,
                                            }}
                                        >
                                            <Grid container item alignItems={"center"} sx={{marginRight: "3px"}}>
                                                <Typography variant={"caption"}
                                                            sx={{color: "white", fontWeight: "600"}}>
                                                    {item.name.toUpperCase()}
                                                </Typography>
                                            </Grid>
                                            <Grid container item alignItems={"center"}
                                                  sx={{color: "rgba(16,27,44,0.8)"}}>
                                                {item.value}
                                            </Grid>
                                        </Grid>
                                    )
                                ) : "-"
                            }
                        </Grid>
                    </Grid>


                    <Grid container item spacing={1} xs={12}>
                        <Grid item xs={"auto"} sx={{fontWeight: 600}}>Imágenes:</Grid>
                        <Grid item xs={true}>
                            {
                                row.images.length > 0
                                    ? (
                                        <Box
                                            sx={{
                                                cursor: "pointer",
                                                display: "inline-flex",
                                                alignItems: "center",
                                                color: "blue"
                                            }}
                                            onClick={() => handleOpenImagesDialog(row.images)}
                                        >
                                            {row.images.length}

                                            <VisibilityOutlined fontSize={"small"}
                                                                sx={{ml: "5px"}}/>
                                        </Box>
                                    ) : "no"
                            }
                        </Grid>
                    </Grid>


                    <Grid container item spacing={1} xs={12}>
                        <Grid item xs={"auto"} sx={{fontWeight: 600}}>Ganancia del vendedor por producto:</Grid>
                        <Grid item xs={true}>
                            {showSellerProfit()}
                            <IconButton size="small" color="primary" onClick={() => setActiveModalSellerProfit(true)}>
                                <EditOutlined fontSize="small"/>
                            </IconButton>
                        </Grid>
                    </Grid>

                    <Grid container item spacing={1} xs={12}>
                        <Grid item xs={"auto"} sx={{fontWeight: 600}}>Disponible:</Grid>

                        <Grid item>
                            <Switch
                                size='small'
                                checked={isActive}
                                color={'success'}
                                onChange={() => setIsActive(!details.is_active)}
                            />
                        </Grid>

                    </Grid>


                    <Grid container item spacing={1} xs={12}>
                        <Grid item xs={"auto"} sx={{fontWeight: 600}}>Ofertas</Grid>

                        <IconButton onClick={() => setShowOffers((e) => !e)}>
                            {(showOffers)
                                ? < ExpandLessOutlined/>
                                : <ExpandMoreOutlined/>
                            }
                        </IconButton>
                    </Grid>

                    <Collapse in={showOffers} timeout="auto" unmountOnExit>
                        <StoreListOffers/>
                    </Collapse>

                </Grid>
            </Collapse>

        </>
    )
}

export default StoreMoreDetails
