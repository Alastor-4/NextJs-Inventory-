import { EditOutlined, ExpandLessOutlined, ExpandMoreOutlined, VisibilityOutlined } from '@mui/icons-material'
import { Box, Collapse, Grid, IconButton, Switch, Typography } from '@mui/material'
import React, { useEffect, useState } from 'react'
import StoreListOffers from './StoreListOffers'
import StoreEditSellerProfit from '@/app/profile/[id]/store-details/[storeDetailsId]/components/Modal/StoreEditSellerProfit'
import StoreModalDefault from './Modal/StoreModalDefault'
import ImagesDisplayDialog from '@/components/ImagesDisplayDialog'
import { storeDetails } from '../request/storeDetails'
function StoreMoreDetails({ userId, details, show, loadDates, row }) {


    const [showOffers, setShowOffers] = useState(false)
    const [activeModalSellerProfit, setActiveModalSellerProfit] = useState(false);

    const [openImageDialog, setOpenImageDialog] = useState(false);
    const [dialogImages, setDialogImages] = useState([])

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

            <StoreModalDefault
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
            </StoreModalDefault>

            <ImagesDisplayDialog
                dialogTitle={"Imágenes del producto"}
                open={openImageDialog}
                setOpen={setOpenImageDialog}
                images={dialogImages}
            />

            <Collapse in={show} timeout="auto" unmountOnExit>
                <Grid container spacing={1} sx={{ padding: "8px 26px" }}>
                    <Grid item xs={12}>
                        <Typography variant="subtitle1" gutterBottom component="div">
                            Detalles:
                        </Typography>
                    </Grid>


                    <Grid container item spacing={1} xs={12}>
                        <Grid item xs={"auto"} sx={{ fontWeight: 600 }}>Producto:</Grid>
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
                        <Grid item xs={"auto"} sx={{ fontWeight: 600 }}>Departamento:</Grid>
                        <Grid item xs={true}>{row.departments?.name ?? "-"}</Grid>
                    </Grid>


                    <Grid container item spacing={1} xs={12}>
                        <Grid item xs={"auto"} sx={{ fontWeight: 600, display: "flex", alignItems: "center" }}>Características:</Grid>
                        <Grid item xs={true} sx={{ display: "flex", alignItems: "center" }}>
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
                                        <Grid container item alignItems={"center"} sx={{ marginRight: "3px" }}>
                                            <Typography variant={"caption"}
                                                sx={{ color: "white", fontWeight: "600" }}>
                                                {item.name.toUpperCase()}
                                            </Typography>
                                        </Grid>
                                        <Grid container item alignItems={"center"}
                                            sx={{ color: "rgba(16,27,44,0.8)" }}>
                                            {item.value}
                                        </Grid>
                                    </Grid>
                                )
                                ) : "-"
                            }
                        </Grid>
                    </Grid>


                    <Grid container item spacing={1} xs={12}>
                        <Grid item xs={"auto"} sx={{ fontWeight: 600 }}>Imágenes:</Grid>
                        <Grid item xs={true}>
                            {
                                row.images.length > 0
                                    ? (
                                        <Box
                                            sx={{ cursor: "pointer", display: "inline-flex", alignItems: "center", color: "blue" }}
                                            onClick={() => handleOpenImagesDialog(row.images)}
                                        >
                                            {row.images.length}

                                            <VisibilityOutlined fontSize={"small"}
                                                sx={{ ml: "5px" }} />
                                        </Box>
                                    ) : "no"
                            }
                        </Grid>
                    </Grid>


                    <Grid container item spacing={1} xs={12}>
                        <Grid item xs={"auto"} sx={{ fontWeight: 600 }}>Ganancia del vendedor por producto:</Grid>
                        <Grid item container xs={true}>

                            <Grid item>
                                {showSellerProfit()}
                            </Grid>

                            <Grid item>
                                <IconButton sx={{ padding: 0 }} size="small" color="primary" onClick={() => setActiveModalSellerProfit(true)} >
                                    <EditOutlined fontSize="small" />
                                </IconButton>
                            </Grid>

                        </Grid>
                    </Grid>

                    <Grid container item spacing={1} xs={12}>
                        <Grid item xs={"auto"} sx={{ fontWeight: 600 }}>Unidades restantes de total:</Grid>
                        <Grid item container xs={true}>
                            {
                                `${row.depots[0].store_depots[0].product_remaining_units} de ${row.depots[0].store_depots[0].product_units}`
                            }
                        </Grid>
                    </Grid>

                    <StoreListOffers productStoreDepot={row.depots[0].store_depots[0]} loadDates={loadDates} showOffers={showOffers} setShowOffers={setShowOffers} />


                </Grid>
            </Collapse>

        </>
    )
}

export default StoreMoreDetails
