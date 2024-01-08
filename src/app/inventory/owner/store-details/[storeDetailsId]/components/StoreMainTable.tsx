"use client"

import {
    AppBar, Avatar, AvatarGroup, Box, Button, Card, CardContent, Grid,
    IconButton, InputBase, Switch, Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, Toolbar, Tooltip, Typography
} from "@mui/material";
import {
    AddOutlined, ArrowLeft, DescriptionOutlined, EditOutlined,
    ExpandLessOutlined, ExpandMoreOutlined, FilterAlt, HelpOutline, ShareOutlined, SwapHoriz
} from "@mui/icons-material";
import ModalAddProductFromWarehouse from "../../../store-assign/addProductFromWarehouse/components/ModalAddProductFromWarehouse";
import { StoreMainTableProps, allProductsByDepartmentProps, productsProps, storeWithStoreDepots } from "@/types/interfaces";
import AddProductFromWarehouse from "../../../store-assign/addProductFromWarehouse/components/AddProductFromWarehouse";
import ImagesDisplayDialog from "@/components/ImagesDisplayDialog";
import { InfoTag, MoneyInfoTag } from "@/components/InfoTags";
import StoreModalDefault from "./Modal/StoreModalDefault";
import { numberFormat } from "@/utils/generalFunctions";
import { TableNoData } from "@/components/TableNoData";
import { storeDetails } from "../request/storeDetails";
import { images, store_depots } from "@prisma/client";
import StoreModalPrice from "./Modal/StoreModalPrice"
import StoreEditPrice from "./Modal/StoreEditPrice";
import stores from "../../../store/requests/stores";
import StoreEditUnits from "./Modal/StoreEditUnits";
import React, { useEffect, useState } from "react";
import StoreMoreDetails from "./StoreMoreDetails";
import TransferUnits from "./Modal/TransferUnits";
import { useRouter } from "next/navigation";
import { Formik } from "formik";
import FilterProductsByDepartmentsModal from "@/components/modals/FilterProductsByDepartmentsModal";
import InfoTooltip from "@/components/InfoTooltip";
import SearchIcon from '@mui/icons-material/Search';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export const StoreMainTable = ({ userId, dataStoreDetails }: StoreMainTableProps) => {
    const router = useRouter();

    // Guardan datos de bd
    const [dataProducts, setDataProducts] = useState<productsProps[] | null>(null);
    const [allProductsByDepartment, setAllProductsByDepartment] = useState<allProductsByDepartmentProps[] | null>(null);
    const [selectedDepartments, setSelectedDepartments] = useState<allProductsByDepartmentProps[] | null>(null);
    const [depotsInStore, setDepotsInStore] = useState<number | null>(dataStoreDetails?.store_depots?.length!);

    const [dataStore, setDataStore] = useState<storeWithStoreDepots | null>(dataStoreDetails);

    // Se usan habilitar modales o detalles
    const [showDetails, setShowDetails] = useState<number>(-1);
    const [activeModalPrice, setActiveModalPrice] = useState<{ active: boolean, storeDepot: store_depots | null }>({ active: false, storeDepot: null });
    const [activeModalTransferUnits, setActiveModalTransferUnits] = useState<boolean>(false);
    const [activeModalEditUnits, setActiveModalEditUnits] = useState<boolean>(false);
    const [activeAddProductFromWarehouse, setActiveAddProductFromWarehouse] = useState<boolean>(false);

    // Almacena el ind de la row seleccionada
    // modal q la usan:  TransferUnits , StoreEditUnits
    const [selectedRowInd, setSelectedRowInd] = useState<number>(-1);

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
        fetcher(`/inventory/owner/store-details/${dataStoreDetails?.id}/api`).then((data: allProductsByDepartmentProps[]) =>
            setAllProductsByDepartment(data.map((productsByDepartments: allProductsByDepartmentProps) => ({
                ...productsByDepartments,
                selected: false
            }))));
    }, [dataStoreDetails]);

    //Update allProducts at change
    useEffect(() => {
        if (allProductsByDepartment?.length) {
            let allProducts: productsProps[] = [];
            let bool = false;
            if (selectedDepartments) {
                for (const department of selectedDepartments!) if (department.selected === true) bool = true;
            }
            allProductsByDepartment?.forEach((productsByDepartments) => {
                if (!selectedDepartments || selectedDepartments?.length! === 0 || !bool) {
                    allProducts = [...allProducts, ...productsByDepartments.products!];
                }
                if (selectedDepartments?.length! > 0 && bool) {
                    if (productsByDepartments.selected) {
                        allProducts = [...allProducts, ...productsByDepartments.products!];
                    }
                }
            });

            allProducts.sort((a: productsProps, b: productsProps) => {
                if (a?.name! < b?.name!) return -1;
                if (a?.name! > a?.name!) return 1;
                return 0;
            });
            setDataProducts(allProducts);
        }
    }, [allProductsByDepartment, selectedDepartments, isFilterModalOpen]);

    //GET store name
    useEffect(() => {
        const getDataStore = async () => {
            const datastore = await stores.storeDetails(userId!, dataStoreDetails?.id!);
            setDataStore(datastore);
        }
        if (!dataStore) getDataStore();

    }, [dataStoreDetails?.id, userId, dataStore]);

    const handleNavigateBack = () => router.back();
    // active - noActive
    const updateProductActive = async (product: store_depots) => {
        const data = {
            id: product.id,
            store_id: product.store_id,
            depot_id: product.depot_id,
            product_units: product.product_units,
            product_remaining_units: product.product_remaining_units,
            seller_profit_percentage: product.seller_profit_percentage,
            is_active: !product.is_active,
            sell_price: product.sell_price,
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
                    <IconButton color={"inherit"} onClick={() => router.push(`/inventory/owner/store-assign?storeId=${dataStore?.id}`)} >
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
            {
                id: "name",
                label: "Nombre",
            },
            {
                id: "departaments",
                label: "Departamento",
            },
            {
                id: "buy_Price",
                label: "Precio",
            },
            {
                id: "units",
                label: "Unidades",
            },
            {
                id: "Active",
                label: "Estado",
            },
            {
                id: "details",
                label: "",
            },
        ]

        return (
            <TableHead>
                <TableRow>
                    {headCells.map(headCell => (
                        <TableCell
                            key={headCell.id}
                            align={"left"}
                            padding={'normal'}
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
            newAllProductsByDepartment = newAllProductsByDepartment.map((productsByDepartments: allProductsByDepartmentProps) => ({
                ...productsByDepartments,
                selected: false
            }))
            setAllProductsByDepartment(newAllProductsByDepartment);
        }
    }

    const [openImagesDialog, setOpenImagesDialog] = useState(false);
    const [dialogImages, setDialogImages] = useState<images[] | null>();

    const handleOpenImagesDialog = (images: images[]) => {
        setDialogImages(images)
        setOpenImagesDialog(true)
    }

    const TableContent = ({ formik }: { formik: any }) => {
        return (
            <TableBody>
                {dataProducts?.filter(
                    (product: productsProps) =>
                        product?.name!.toUpperCase().includes(formik.values.searchBarValue.toUpperCase())).map(
                            (product: productsProps, index: number) => {

                                const baseProductPrice = +product?.depots![0].store_depots![0].sell_price! === 0
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
                                            <TableCell>
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
                                                <Box display={"flex"} >
                                                    {product.name}
                                                </Box>
                                            </TableCell>
                                            <TableCell>
                                                {product.departments?.name}
                                            </TableCell>
                                            <TableCell>
                                                <Grid container rowSpacing={1}>
                                                    <Grid item xs={12}>
                                                        <div
                                                            onClick={(e: any) => {
                                                                e.stopPropagation()
                                                                setActiveModalPrice({ active: true, storeDepot: { ...product?.depots![0].store_depots![0] } });
                                                            }}
                                                        >
                                                            <MoneyInfoTag
                                                                value={displayProductPrice}
                                                                errorColor={!baseProductPrice}
                                                            />
                                                        </div>
                                                        {product?.depots![0].store_depots![0].product_offers?.length! && (
                                                            <DescriptionOutlined fontSize={"small"} />
                                                        )}
                                                    </Grid>
                                                    {
                                                        displayPriceDiscount && (
                                                            <Grid item xs={12}>
                                                                <div
                                                                    onClick={(e: any) => {
                                                                        e.stopPropagation()
                                                                        setActiveModalPrice({
                                                                            active: true,
                                                                            storeDepot: { ...product?.depots![0].store_depots![0] }
                                                                        })
                                                                    }}
                                                                >
                                                                    <InfoTag value={`- ${displayPriceDiscount}`} />
                                                                </div>
                                                            </Grid>
                                                        )
                                                    }
                                                </Grid>
                                            </TableCell>
                                            <TableCell>
                                                <Grid container rowSpacing={1}>
                                                    <Grid container item xs={12} justifyContent={"center"}>
                                                        {`${product?.depots![0].store_depots![0].product_remaining_units} de ${product?.depots![0].store_depots![0].product_units}`}
                                                    </Grid>
                                                    <Grid container item xs={12} justifyContent={"center"} flexWrap={"nowrap"}>
                                                        <IconButton
                                                            size={"small"}
                                                            onClick={(e) => {
                                                                e.stopPropagation()
                                                                setActiveModalTransferUnits(true);
                                                                setSelectedRowInd(index)
                                                            }}>
                                                            <SwapHoriz />
                                                        </IconButton>
                                                        <IconButton
                                                            size={"small"}
                                                            onClick={(e) => {
                                                                e.stopPropagation()
                                                                setActiveModalEditUnits(true);
                                                                setSelectedRowInd(index)
                                                            }}>
                                                            <EditOutlined />
                                                        </IconButton>
                                                    </Grid>
                                                </Grid>
                                            </TableCell>
                                            <TableCell>
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
                                            <TableCell style={{ padding: 0 }} colSpan={5}>
                                                <Tooltip title={"Detalles"}>
                                                    <IconButton
                                                        size={"small"}
                                                        sx={{ m: "3px" }}
                                                        onClick={() => setShowDetails((showDetails !== product.id) ? product.id : -1)}
                                                    >
                                                        {
                                                            (showDetails !== product.id)
                                                                ? <ExpandMoreOutlined />
                                                                : <ExpandLessOutlined />
                                                        }
                                                    </IconButton>
                                                </Tooltip>
                                            </TableCell>
                                        </TableRow>
                                        <TableRow >
                                            <TableCell style={{ padding: 0 }} colSpan={6}>
                                                {showDetails === product.id && (
                                                    <StoreMoreDetails
                                                        userId={userId}
                                                        details={product?.depots![0].store_depots![0]}
                                                        show={(showDetails === product.id)}
                                                        loadData={loadData}
                                                        row={product}
                                                    />
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    </React.Fragment>
                                )
                            })}
            </TableBody>
        )
    }

    return (
        <>
            <CustomToolbar />
            <FilterProductsByDepartmentsModal
                allProductsByDepartment={allProductsByDepartment!}
                setSelectedDepartments={setSelectedDepartments}
                isFilterModalOpen={isFilterModalOpen}
                toggleModalFilter={toggleModalFilter}
            />
            <ImagesDisplayDialog
                open={openImagesDialog}
                setOpen={setOpenImagesDialog}
                images={dialogImages!}
            />

            <StoreModalPrice
                dialogTitle={"Editar Precio"}
                open={activeModalPrice.active}
                setOpen={setActiveModalPrice}
            >
                <StoreEditPrice storeDepot={activeModalPrice.storeDepot!} setActiveModalPrice={setActiveModalPrice} loadData={loadData} />
            </StoreModalPrice>

            <StoreModalDefault
                dialogTitle={"Modificar Total"}
                open={activeModalEditUnits}
                setOpen={setActiveModalEditUnits}
            >
                <StoreEditUnits
                    dataRow={selectedRowInd > 0 ? dataProducts![selectedRowInd]?.depots![0].store_depots![0] : null}
                    setActiveModalEditUnits={setActiveModalEditUnits}
                    loadData={loadData}
                />
            </StoreModalDefault>

            <StoreModalDefault
                dialogTitle={"Transferir unidades"}
                open={activeModalTransferUnits}
                setOpen={setActiveModalTransferUnits}
            >
                <TransferUnits
                    nameStore={dataStore?.name!}
                    storeDepot={selectedRowInd > 0 ? dataProducts![selectedRowInd].depots![0].store_depots![0] : null}
                    productId={selectedRowInd > 0 ? dataProducts![selectedRowInd].depots![0].product_id : null}
                    setActiveTransferUnits={setActiveModalTransferUnits}
                    loadData={loadData}
                />
            </StoreModalDefault>

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
                                            <Button size="small" color="primary" onClick={toggleModalFilter} startIcon={<FilterAlt />} variant="outlined">Filtrar</Button>
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
                                                    <TableNoData hasData={depotsInStore} />
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