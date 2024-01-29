"use client"

import {
    AppBar, Avatar, AvatarGroup, Box, Button, Card, CardContent, Grid,
    IconButton, InputBase, Switch, Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, Toolbar, Typography
} from "@mui/material";
import {
    AddOutlined, ArrowLeft, DescriptionOutlined,
    FilterAlt, HelpOutline, ShareOutlined,
} from "@mui/icons-material";
import { StoreMainTableProps, allProductsByDepartmentProps, productsProps, storeDepotsWithAny, storeWithStoreDepots } from "@/types/interfaces";
import ModalAddProductFromWarehouse from "../../../store-assign/addProductFromWarehouse/components/ModalAddProductFromWarehouse";
import AddProductFromWarehouse from "../../../store-assign/addProductFromWarehouse/components/AddProductFromWarehouse";
import FilterProductsByDepartmentsModal from "@/components/modals/FilterProductsByDepartmentsModal";
import { CustomTooltip, InfoTag, MoneyInfoTag } from "@/components/InfoTags";
import ImagesDisplayDialog from "@/components/ImagesDisplayDialog";
import { useParams, useRouter } from "next/navigation";
import { numberFormat } from "@/utils/generalFunctions";
import { TableNoData } from "@/components/TableNoData";
import { storeDetails } from "../request/storeDetails";
import stores from "../../../store/requests/stores";
import SearchIcon from '@mui/icons-material/Search';
import React, { useEffect, useState } from "react";
import InfoTooltip from "@/components/InfoTooltip";
import { grey } from "@mui/material/colors";
import { images } from "@prisma/client";
import { Formik } from "formik";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export const StoreMainTable = ({ userId, ownerId }: StoreMainTableProps) => {
    const router = useRouter();
    const { storeDetailsId } = useParams();

    // Guardan datos de bd
    const [dataProducts, setDataProducts] = useState<productsProps[] | null>(null);
    const [allProductsByDepartment, setAllProductsByDepartment] = useState<allProductsByDepartmentProps[] | null>(null);
    const [filtersApplied, setFiltersApplied] = useState<boolean>(false);

    const [dataStore, setDataStore] = useState<storeWithStoreDepots | null>(null);

    // Se usan habilitar modales o detalles
    const [showDetails, setShowDetails] = useState<number>(-1);
    const [activeModalPrice, setActiveModalPrice] = useState<{ active: boolean, storeDepot: storeDepotsWithAny | null }>({ active: false, storeDepot: null });
    const [activeAddProductFromWarehouse, setActiveAddProductFromWarehouse] = useState<boolean>(false);

    const [isFilterModalOpen, setIsFilterModalOpen] = useState<boolean>(false);
    const toggleModalFilter = () => {
        if (!dataProducts) return;
        setIsFilterModalOpen(!isFilterModalOpen);
    }

    const [isOpenTooltip, setIsOpenTooltip] = useState<boolean>(false);
    const handleTooltipClose = () => setIsOpenTooltip(false);
    const handleTooltipOpen = () => setIsOpenTooltip(true);

    //GET initial data
    useEffect(() => {
        fetcher(`/inventory/keeper/store-details/${storeDetailsId}/api`).then((data: allProductsByDepartmentProps[]) =>
            setAllProductsByDepartment(data.map((productsByDepartments: allProductsByDepartmentProps) => ({
                ...productsByDepartments,
                selected: false
            }))));
    }, [storeDetailsId]);

    //Update allProducts at change
    useEffect(() => {
        if (allProductsByDepartment?.length) {
            let allProducts: productsProps[] = [];

            allProductsByDepartment.forEach((productsByDepartments) => {
                //when there are no filters applied all departments are returned
                if (!filtersApplied || productsByDepartments.selected) {
                    allProducts = [...allProducts, ...productsByDepartments.products!];
                }
            });

            allProducts.sort((a: productsProps, b: productsProps) => {
                if (a?.name! < b?.name!) return -1;
                if (a?.name! > a?.name!) return 1;
                return 0;
            });
            setDataProducts(allProducts);
        }
    }, [allProductsByDepartment, filtersApplied]);

    //GET store name
    useEffect(() => {
        const getDataStore = async () => {
            const datastore = await stores.storeDetails(ownerId!, storeDetailsId!);
            setDataStore(datastore);
        }
        getDataStore();

    }, [storeDetailsId, ownerId]);

    const handleNavigateBack = () => router.back();
    // active - noActive
    const updateProductActive = async (product: storeDepotsWithAny) => {
        const data = {
            id: product.id,
            store_id: product.store_id,
            depot_id: product.depot_id,
            product_units: product.product_units,
            product_remaining_units: product.product_remaining_units,
            seller_profit_percentage: product.seller_profit_percentage,
            is_active: !product.is_active,
            sell_price: parseFloat(`${product.sell_price}`),
            sell_price_unit: product.sell_price_unit,
            seller_profit_quantity: product.seller_profit_quantity,
            price_discount_percentage: product.price_discount_percentage,
            price_discount_quantity: product.price_discount_quantity,
        }
        const response = await storeDetails.update(product.id, data)
        if (response === 200) {
            await loadData();
        }
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
                            letterSpacing: ".2rem",
                            color: "white",
                        }}
                    >
                        {dataStore ? dataStore.name : 'Productos'}
                    </Typography>
                </Box>

                <Box sx={{ display: "flex" }}>
                    <IconButton color={"inherit"} onClick={() => router.push(`/inventory/keeper/store-assign?storeId=${dataStore?.id}`)} >
                        <ShareOutlined fontSize={"small"} />
                    </IconButton>
                    <IconButton color={"inherit"} onClick={() => setActiveAddProductFromWarehouse(true)} >
                        <AddOutlined />
                    </IconButton>
                </Box>
            </Toolbar>
        </AppBar>
    )

    const TableHeader = () => {
        const headCells = [
            // { id: "details", label: "", padding: "checkbox", },
            { id: "name", label: "Nombre", },
            { id: "departaments", label: "Departamento", },
            { id: "buy_Price", label: "Precio", },
            { id: "units", label: "Unidades", },
            { id: "Active", label: "Estado", },
        ]

        return (
            <TableHead>
                <TableRow>
                    {headCells.map(headCell => (
                        <TableCell
                            key={headCell.id}
                            align={"center"}
                            // @ts-ignore
                            padding={headCell.padding ? headCell.padding : "normal"}
                        >
                            {headCell.label}
                        </TableCell>
                    ))}
                </TableRow>
            </TableHead>
        )
    }

    const loadData = async () => {
        let newAllProductsByDepartment: allProductsByDepartmentProps[] | null = await storeDetails.getAllProductsByDepartment(dataStore?.id!);
        if (newAllProductsByDepartment) {
            newAllProductsByDepartment = newAllProductsByDepartment.map((productsByDepartments: allProductsByDepartmentProps) => {
                //search if current department was selected in previous data to keep selection

                let oldDepartmentSelected = false

                const oldDepartmentIndex = allProductsByDepartment?.findIndex((productsByDepartmentItem: allProductsByDepartmentProps) => productsByDepartmentItem.id === productsByDepartments.id)
                if (oldDepartmentIndex! > -1 && allProductsByDepartment![oldDepartmentIndex!].selected) {
                    oldDepartmentSelected = true
                }

                return (
                    {
                        ...productsByDepartments,
                        selected: oldDepartmentSelected
                    }
                )
            })
            setAllProductsByDepartment(newAllProductsByDepartment);
        }
    }

    const [openImagesDialog, setOpenImagesDialog] = useState(false);
    const [dialogImages, setDialogImages] = useState<images[] | null>();

    const handleOpenImagesDialog = (images: images[]) => {
        setDialogImages(images)
        setOpenImagesDialog(true)
    }

    // function productHasActiveOffer(offers: any[]) {
    //     return offers.some((item: any) => item.is_active)
    // }

    const TableContent = ({ formik }: { formik: any }) => {
        return (
            <TableBody>
                {dataProducts?.filter(
                    (product: productsProps) =>
                        product?.name!.toUpperCase().includes(formik.values.searchBarValue.toUpperCase())).map(
                            (product: productsProps, index: number) => {

                                const baseProductPrice = product?.depots![0].store_depots![0].sell_price! === 0
                                    ? null
                                    : numberFormat(`${product?.depots![0].store_depots![0].sell_price}`)

                                const priceDiscountQuantity = baseProductPrice
                                    ? product?.depots![0].store_depots![0].price_discount_percentage
                                        ? product?.depots![0].store_depots![0].price_discount_percentage * parseFloat(String(baseProductPrice)) / 100
                                        : product?.depots![0].store_depots![0].price_discount_quantity
                                    : null

                                const finalProductPrice = baseProductPrice && priceDiscountQuantity
                                    ? (parseFloat(String(baseProductPrice)) - priceDiscountQuantity)
                                    : baseProductPrice

                                // const sellerProfitQuantity = finalProductPrice
                                //     ? product?.depots![0].store_depots![0].seller_profit_percentage
                                //         ? product?.depots![0].store_depots![0].seller_profit_percentage * finalProductPrice / 100
                                //         : product?.depots![0].store_depots![0].seller_profit_quantity
                                //     : null

                                const displayProductPrice = finalProductPrice
                                    ? `${numberFormat(`${finalProductPrice}`) + " " + product?.depots![0].store_depots![0].sell_price_unit}`
                                    : "sin precio"

                                const displayPriceDiscount = baseProductPrice
                                    ? product?.depots![0].store_depots![0].price_discount_percentage
                                        ? numberFormat(`${product?.depots![0].store_depots![0].price_discount_percentage}`) + " %"
                                        : product?.depots![0].store_depots![0].price_discount_quantity
                                            ? numberFormat(`${product?.depots![0].store_depots![0].price_discount_quantity}`) + " " + product.depots[0].store_depots[0].sell_price_unit
                                            : null
                                    : null

                                return (
                                    <React.Fragment key={product.id}>
                                        <TableRow
                                            hover
                                            tabIndex={-1}
                                            onClick={() => setShowDetails((showDetails !== product.id) ? product.id : -1)}
                                        >
                                            {/* <TableCell style={{ padding: 0 }}>
                                                <IconButton
                                                    size={"small"}
                                                    onClick={() => setShowDetails((showDetails !== product.id) ? product.id : -1)}
                                                >
                                                    {
                                                        (showDetails !== product.id)
                                                            ? <ExpandMoreOutlined />
                                                            : <ExpandLessOutlined />
                                                    }
                                                </IconButton>
                                            </TableCell> */}
                                            <TableCell align={"center"}>
                                                {
                                                    product.images?.length! > 0 && (
                                                        <Box display={"flex"} justifyContent={"center"}>
                                                            <AvatarGroup
                                                                max={2}
                                                                sx={{ flexDirection: "row", width: "fit-content" }}
                                                                onClick={(e) => {
                                                                    e.stopPropagation()
                                                                    handleOpenImagesDialog(product.images!)
                                                                }}
                                                            >
                                                                {product?.images?.map(
                                                                    (imageItem: images) => <Avatar
                                                                        variant={"rounded"}
                                                                        key={`producto-${imageItem.id}`}
                                                                        alt={`producto-${imageItem.id}`}
                                                                        src={imageItem.fileUrl!}
                                                                        sx={{ cursor: "pointer", border: "1px solid lightblue" }}
                                                                    />
                                                                )}
                                                            </AvatarGroup>
                                                        </Box>
                                                    )
                                                }
                                                <Box >
                                                    {product.name}
                                                </Box>
                                            </TableCell>
                                            <TableCell align={"center"}>
                                                {product.departments?.name}
                                            </TableCell>
                                            <TableCell align={"center"}>
                                                <Grid item container rowSpacing={1}>
                                                    <Grid container item xs={12} flexWrap={"nowrap"} alignItems={"center"}>
                                                        <MoneyInfoTag
                                                            value={displayProductPrice}
                                                            errorColor={!baseProductPrice}
                                                        // action={() => setActiveModalPrice({ storeDepot: { ...product?.depots![0].store_depots![0] }, active: true })}
                                                        />
                                                        {
                                                            !!product?.depots![0].store_depots![0]._count!.product_offers && (
                                                                <CustomTooltip tooltipText={"Ofertas activas"}>
                                                                    <DescriptionOutlined fontSize={"small"} />
                                                                </CustomTooltip>
                                                            )
                                                        }
                                                    </Grid>
                                                    {
                                                        displayPriceDiscount && (
                                                            <Grid item xs={12}>
                                                                <InfoTag
                                                                    value={`- ${displayPriceDiscount}`}
                                                                    action={() => setActiveModalPrice({ storeDepot: { ...product?.depots![0].store_depots![0] }, active: true })}
                                                                    tooltipText={product?.depots![0].store_depots![0].discount_description}
                                                                />
                                                            </Grid>
                                                        )
                                                    }
                                                </Grid>
                                            </TableCell>
                                            <TableCell align={"center"}>
                                                {product?.depots![0].store_depots![0].product_remaining_units}
                                            </TableCell>
                                            <TableCell align={"center"}>
                                                <Grid container>
                                                    <Grid container item xs={12} justifyContent={"center"} flexWrap={"nowrap"} sx={{ whiteSpace: "nowrap" }}>
                                                        <Typography variant={"button"}>
                                                            {product?.depots![0].store_depots![0].is_active
                                                                ? "en venta"
                                                                : "inactivo"
                                                            }
                                                        </Typography>
                                                    </Grid>
                                                    <Grid container item xs={12} justifyContent={"center"}>
                                                        <Switch
                                                            size='small'
                                                            checked={product?.depots![0].store_depots![0].is_active!}
                                                            color={'success'}
                                                            disabled={!baseProductPrice}
                                                            onClick={(e) => {
                                                                e.stopPropagation()
                                                                return updateProductActive(product?.depots![0].store_depots![0])
                                                            }}
                                                        />
                                                    </Grid>
                                                </Grid>
                                            </TableCell>
                                        </TableRow>
                                        {/* <TableRow >
                                            <TableCell style={{ padding: 0 }} colSpan={6}>
                                                {showDetails === product.id && (
                                                    <StoreMoreDetails
                                                        userId={userId}
                                                        show={(showDetails === product.id)}
                                                        loadData={loadData}
                                                        row={product}
                                                        dataStore={dataStore}
                                                        baseProductPrice={baseProductPrice}
                                                        displayProductPrice={displayProductPrice}
                                                        priceDiscountQuantity={priceDiscountQuantity}
                                                        displayPriceDiscount={displayPriceDiscount}
                                                        sellerProfitQuantity={sellerProfitQuantity}
                                                        finalProductPrice={finalProductPrice}
                                                    />
                                                )}
                                            </TableCell>
                                        </TableRow> */}
                                    </React.Fragment>
                                )
                            })}
            </TableBody>
        )
    }

    return (
        <>
            <CustomToolbar />

            {isFilterModalOpen && (allProductsByDepartment?.length! > 0) && (
                <FilterProductsByDepartmentsModal
                    allProductsByDepartment={allProductsByDepartment!}
                    setAllProductsByDepartment={setAllProductsByDepartment}
                    setFiltersApplied={setFiltersApplied}
                    isFilterModalOpen={isFilterModalOpen}
                    toggleModalFilter={toggleModalFilter}
                />
            )}

            <ImagesDisplayDialog
                open={openImagesDialog}
                setOpen={setOpenImagesDialog}
                images={dialogImages!}
            />

            {/* {
                activeModalPrice.active && (
                    <ModalProductPrice
                        dialogTitle="Editar Precio"
                        activeModalPrice={activeModalPrice.active}
                        storeDepot={activeModalPrice.storeDepot}
                        setActiveModalPrice={setActiveModalPrice}
                        loadData={loadData}
                    />
                )
            } */}

            <ModalAddProductFromWarehouse
                dialogTitle={"Agregar productos"}
                open={activeAddProductFromWarehouse}
                setOpen={setActiveAddProductFromWarehouse}
                loadData={loadData}
            >
                <AddProductFromWarehouse dataStore={dataStore!} warehouseId={null} />
            </ModalAddProductFromWarehouse>
            <Formik
                initialValues={{ searchBarValue: "" }}
                onSubmit={() => { }}
            >
                {
                    (formik) => (
                        <Card variant={"outlined"}>
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
                                                message={"Puede buscar por nombre y descripción ó filtrar por departamentos"}
                                            >
                                                <IconButton onClick={handleTooltipOpen}>
                                                    <HelpOutline />
                                                </IconButton>
                                            </InfoTooltip>
                                        </Grid>
                                    </Grid>
                                    <Grid container spacing={2} alignItems="center">
                                        <Grid item xs={true} md={8}>
                                            <Grid item container xs={12} border={"1px solid gray"} borderRadius={"5px"} margin="4px" position="relative" >
                                                <Grid item position="absolute" height="100%" paddingLeft="4px" display="flex" alignItems="center" justifyContent="center" >
                                                    <SearchIcon color="action" />
                                                </Grid>
                                                <Grid item width="100%" paddingLeft="35px" >
                                                    <InputBase
                                                        placeholder="Buscar producto..."
                                                        inputProps={{ 'aria-label': 'search' }}
                                                        {...formik.getFieldProps("searchBarValue")}
                                                    />
                                                </Grid>
                                            </Grid>
                                        </Grid>
                                        <Grid container item xs={"auto"} md={4} justifyContent={"center"}>
                                            <Button size="small"
                                                sx={{
                                                    color: grey[600],
                                                    borderColor: grey[600],
                                                    '&:hover': {
                                                        borderColor: grey[800],
                                                        backgroundColor: grey[200],
                                                    },
                                                }}
                                                onClick={toggleModalFilter} startIcon={<FilterAlt />} variant="outlined">Filtrar</Button>
                                        </Grid>
                                    </Grid>
                                </Card>
                                <Card variant={"outlined"} sx={{ paddingTop: "20px" }}>
                                    <Grid container rowSpacing={2}>
                                        {
                                            dataProducts?.length! > 0
                                                ? (dataProducts?.filter(
                                                    (product: productsProps) =>
                                                        product?.name?.toUpperCase().includes(formik.values.searchBarValue.toUpperCase()) ||
                                                        product?.description?.toUpperCase().includes(formik.values.searchBarValue.toUpperCase())).length! > 0 ?
                                                    (<TableContainer sx={{ width: "100%", maxHeight: "70vh", overflowX: "auto" }}>
                                                        <Table sx={{ width: "100%" }} size={"small"}>
                                                            <TableHeader />
                                                            <TableContent formik={formik} />
                                                        </Table>
                                                    </TableContainer>) : <TableNoData searchCoincidence />
                                                ) : (
                                                    <TableNoData hasData={dataStore?.store_depots?.length!} />
                                                )
                                        }
                                    </Grid>
                                </Card>
                            </CardContent>
                        </Card>
                    )
                }
            </Formik>
        </>
    )
}

export default StoreMainTable