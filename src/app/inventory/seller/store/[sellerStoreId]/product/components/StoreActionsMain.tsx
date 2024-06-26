"use client"

import {
    AppBar, Avatar, AvatarGroup, Box, Button, Card, CardContent, Checkbox, Collapse,
    Grid, IconButton, InputBase, Switch, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, Toolbar, Typography
} from "@mui/material";
import {
    ArrowLeft, Circle, DescriptionOutlined, ExpandLessOutlined, ExpandMoreOutlined,
    FilterAlt, FilterAltOff, ForwardToInbox, HelpOutline, SellOutlined, SellRounded,
} from "@mui/icons-material";
import sellerStoreProduct from "@/app/inventory/seller/store/[sellerStoreId]/product/requests/sellerStoreProduct";
import { storeDetails } from "@/app/inventory/owner/store-details/[storeDetailsId]/request/storeDetails";
import { StoreActionsMainProps, allProductsByDepartmentProps, productsProps } from "@/types/interfaces";
import FilterProductsByDepartmentsModal from "@/components/modals/FilterProductsByDepartmentsModal";
import { notifyError, notifySuccess, notifyWarning, numberFormat } from "@/utils/generalFunctions";
import FilterProductsByConditionsModal from "@/components/modals/FilterProductsByConditionsModal";
import StoreDepotPropertiesManage from "@/app/inventory/components/StoreDepotPropertiesManage";
import TransferBetweenStores from "./transferBetweenStores/components/TransferBetweenStores";
import { images, product_offers, store_depot_properties } from "@prisma/client";
import ModalTransfer from "./transferBetweenStores/components/ModalTransfer";
import { CustomTooltip, InfoTag, MoneyInfoTag } from "@/components/InfoTags";
import ConfirmDeleteDialog from "@/components/ConfirmDeleteDialog";
import ImagesDisplayDialog from "@/components/ImagesDisplayDialog";
import { TableNoData } from "@/components/TableNoData";
import SearchIcon from '@mui/icons-material/Search';
import ProductSellForm from "./Modal/ProductSellForm";
import React, { useEffect, useState } from "react";
import InfoTooltip from "@/components/InfoTooltip";
import { useRouter } from "next/navigation";
import { grey } from "@mui/material/colors";
import { Formik } from "formik";
import 'dayjs/locale/es';

const StoreActionsMain = ({ storeId }: StoreActionsMainProps) => {
    const router = useRouter();

    const [dataProducts, setDataProducts] = useState<productsProps[] | null>(null);
    const [allProductsByDepartment, setAllProductsByDepartment] = useState<allProductsByDepartmentProps[] | null>(null);
    const [filtersDeparmentsApplied, setFiltersDeparmentsApplied] = useState<boolean>(false);
    const [filtersConditionsApplied, setFiltersConditionsApplied] = useState<boolean>(false);
    const [filteredConditions, setFilteredConditions] = useState<{ label: string, name: string, value: boolean }[] | null>(null);
    const [activeModalTransfer, setActiveModalTransfer] = useState<boolean>(false);
    const [productSelectedForTransfer, setProductSelectedForTransfer] = useState<productsProps | null>(null);

    const [isFilterDepartmentsModalOpen, setIsFilterDepartmentsModalOpen] = useState<boolean>(false);
    const toggleModalDepartmentsFilter = () => {
        if (!dataProducts) return;
        setIsFilterDepartmentsModalOpen(!isFilterDepartmentsModalOpen);
    }

    const [isFilterConditionsModalOpen, setIsFilterConditionsModalOpen] = useState<boolean>(false);
    const toggleModalConditionsFilter = () => {
        if (!dataProducts) return;
        setIsFilterConditionsModalOpen(!isFilterConditionsModalOpen);
    }

    const [isOpenTooltip, setIsOpenTooltip] = useState<boolean>(false);
    const handleTooltipClose = () => setIsOpenTooltip(false);
    const handleTooltipOpen = () => setIsOpenTooltip(true);

    //GET initial data
    useEffect(() => {
        const getAllProductsByDepartment = async () => {
            const newAllProductsByDepartment: allProductsByDepartmentProps[] | null = await sellerStoreProduct.allProductByDepartments(storeId!);

            if (newAllProductsByDepartment) {
                setAllProductsByDepartment(newAllProductsByDepartment.map((productsByDepartments: allProductsByDepartmentProps) => ({
                    ...productsByDepartments,
                    selected: false
                })))
            }
        }
        if (storeId) {
            getAllProductsByDepartment();
        }
    }, [storeId]);

    //Update allProducts at change
    useEffect(() => {
        if (allProductsByDepartment?.length) {
            let allProducts: productsProps[] = [];

            allProductsByDepartment.forEach((productsByDepartments) => {
                //when there are no filters applied all departments are returned

                if (!filtersDeparmentsApplied || productsByDepartments.selected) {
                    allProducts = [...allProducts, ...productsByDepartments.products!];
                }
                if (filtersConditionsApplied && filteredConditions) {
                    const products = allProducts?.filter((product: productsProps) => {
                        if ((!filteredConditions[0].value || product.depots![0].store_depots![0].is_active && filteredConditions[0].value)
                            && (!filteredConditions[1].value || !product.depots![0].store_depots![0].is_active && filteredConditions[1].value)
                            && (!filteredConditions[2].value || product.depots![0].store_depots![0].sell_price === "0" && filteredConditions[2].value)
                            && (!filteredConditions[3].value || (product.depots![0].store_depots![0].price_discount_percentage || product.depots![0].store_depots![0].price_discount_quantity) && filteredConditions[3].value)
                            && (!filteredConditions[4].value || product.depots![0].store_depots![0].product_offers?.length! > 0 && filteredConditions[4].value)
                            && (!filteredConditions[5].value || product.depots![0].store_depots![0].product_remaining_units! === 0 && filteredConditions[5].value)
                            && (!filteredConditions[6].value || product.depots![0].store_depots![0].product_remaining_units! < 10 && filteredConditions[6].value)
                            && (!filteredConditions[7].value || product.depots![0].store_depots![0].product_remaining_units! < 20 && filteredConditions[7].value)
                        ) return product;
                    })
                    allProducts = [...products!];
                }
            });

            allProducts.sort((a: productsProps, b: productsProps) => {
                if (a?.name! < b?.name!) return -1;
                if (a?.name! > a?.name!) return 1;
                return 0;
            });
            setDataProducts(allProducts);
        }
    }, [allProductsByDepartment, filtersDeparmentsApplied, filtersConditionsApplied, filteredConditions]);

    function handleNavigateBack() {
        router.back()
    }

    //Image handlers
    const [openImageDialog, setOpenImagesDialog] = useState<boolean>(false);
    const [dialogImages, setDialogImages] = useState<images[] | null>(null);

    const handleOpenImagesDialog = (images: images[]) => {
        setDialogImages(images);
        setOpenImagesDialog(true);
    }

    const CustomToolbar = () => (
        <AppBar position={"static"} variant={"elevation"} color={"primary"}>
            <Toolbar sx={{ display: "flex", justifyContent: "space-between", color: "white" }}>
                <Box sx={{ display: "flex", alignItems: "center" }}>
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
                        Productos en tienda
                    </Typography>
                </Box>
            </Toolbar>
        </AppBar>
    )

    const TableHeader = () => {
        const headCells = [
            { id: "name", label: "Nombre", },
            { id: "status", label: "", },
            { id: "price", label: "Precio", },
            { id: "quantity", label: "Cantidad", },
            { id: "sale_of_a_product", label: "", },
        ]

        return (
            <TableHead>
                <TableRow>
                    <TableCell
                        align={"left"}
                        padding={'checkbox'}
                    />

                    {headCells.map((headCell: any) => (
                        <TableCell
                            key={headCell.id}
                            align={"center"}
                            padding={"normal"}
                        >
                            {headCell.label}
                        </TableCell>
                    ))}
                </TableRow>
            </TableHead>
        )
    }

    //expand description
    const [expandIndex, setExpandIndex] = useState<number | null>(null);

    const handleExpandRow = (index: number) => {
        if (expandIndex === index) {
            setExpandIndex(null);
        } else {
            setExpandIndex(index);
        }
    }

    //selected products
    const [selectedProducts, setSelectedProducts] = useState<productsProps[]>([]);

    const cancelChecked = (badItemIndex: number) => {
        const newSelectedProducts = selectedProducts.filter((product: productsProps) => product.id !== badItemIndex);
        setSelectedProducts(newSelectedProducts)
    }

    const handleToggleIsActive = async (e: any, badItem: number, storeDepotIndex: number) => {
        e.stopPropagation();

        const updatedDepot = await sellerStoreProduct.toggleIsActiveStoreDepot(storeId!, storeDepotIndex);

        if (updatedDepot) {
            const newDepartments = [...allProductsByDepartment!];
            for (const productsByDepartments of allProductsByDepartment!) {
                const departmentIndex = allProductsByDepartment!.indexOf(productsByDepartments);

                const productIndex = productsByDepartments!.products!.findIndex((product: productsProps) => product.depots![0].store_depots![0].id === storeDepotIndex);
                if (productIndex > -1) {
                    newDepartments[departmentIndex].products![productIndex].depots![0].store_depots![0].is_active = updatedDepot.is_active;
                }
            }

            setAllProductsByDepartment(newDepartments);

            if (updatedDepot.is_active) {
                notifySuccess("Producto en venta ahora");
            } else {
                cancelChecked(badItem)
                notifyWarning("Producto quitado de la venta");
            }
        }
    }

    const updateStoreDepotProperties = async (storeDepotIndex: number, newStoreDepotProperties: store_depot_properties[]) => {
        const newDepartments = [...allProductsByDepartment!];
        for (const productsByDepartments of allProductsByDepartment!) {
            const departmentIndex = allProductsByDepartment!.indexOf(productsByDepartments);

            const productIndex = productsByDepartments!.products!.findIndex((product: productsProps) => product.depots![0].store_depots![0].id === storeDepotIndex);
            if (productIndex > -1) {
                newDepartments![departmentIndex].products![productIndex].depots![0].store_depots![0].store_depot_properties = newStoreDepotProperties
            }
        }

        setAllProductsByDepartment(newDepartments)
    }

    //confirm sell product
    const [sellProductItem, setSellProductItem] = useState<any | null>(null);
    const [openConfirmDialog, setOpenConfirmDialog] = useState(false);

    const handleCloseConfirmDialog = () => setOpenConfirmDialog(false);
    const handleOpenConfirmDialog = (e: any, productItem: any) => {
        e.stopPropagation();
        setSellProductItem(productItem);
        setOpenConfirmDialog(true);
    }

    const handleSellProduct = async () => {
        const updatedDepot = await sellerStoreProduct.sellStoreDepotDefault(storeId!, sellProductItem.depots[0].store_depots[0].id);

        if (updatedDepot) {
            const newDepartments = [...allProductsByDepartment!]
            for (const productsByDepartments of allProductsByDepartment!) {
                const departmentIndex = allProductsByDepartment!.indexOf(productsByDepartments);

                const productIndex = productsByDepartments!.products!.findIndex((product: productsProps) => product.depots![0].store_depots![0].id === sellProductItem.depots![0].store_depots![0].id);
                if (productIndex > -1) {
                    newDepartments[departmentIndex].products![productIndex].depots![0].store_depots![0].product_remaining_units = updatedDepot.product_remaining_units;
                }
            }

            setAllProductsByDepartment(newDepartments);
            if (updatedDepot.product_remaining_units === 0) cancelChecked(sellProductItem.id);
            notifySuccess("Vendida una unidad del producto");
        }
    }

    const handleSelectItem = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>, product: productsProps) => {
        e.stopPropagation();

        let newSelectedProducts = [...selectedProducts];
        const productIndex = selectedProducts.findIndex((productSelected: productsProps) => productSelected.id === product.id);

        if (productIndex > -1) {
            newSelectedProducts.splice(productIndex, 1);
        } else {
            newSelectedProducts.push(product);
        }

        setSelectedProducts(newSelectedProducts);
    }

    const handleClickTransfer = (product: productsProps) => {
        setActiveModalTransfer(true);
        setProductSelectedForTransfer(product);
    }

    const TableContent = ({ formik }: any) => {
        const { searchBarValue } = formik.values;

        const handleToggleOffer = async (offerId: number, storeDepotId: number) => {
            const response = await storeDetails.toggleProductOffers(storeId, offerId);

            if (response) {
                const newDepartments = [...allProductsByDepartment!];
                for (const productsByDepartments of allProductsByDepartment!) {
                    const departmentIndex = allProductsByDepartment!.indexOf(productsByDepartments);

                    const productIndex = productsByDepartments!.products!.findIndex((item: any) => item.depots[0].store_depots[0].id === storeDepotId)
                    if (productIndex > -1) {
                        const offers = allProductsByDepartment![departmentIndex].products![productIndex].depots![0].store_depots![0].product_offers;

                        const offerIndex = offers?.findIndex((offer: any) => offer.id === response.id);
                        if (offerIndex! > -1) {
                            newDepartments[departmentIndex].products![productIndex].depots![0].store_depots![0].product_offers![offerIndex!] = response;
                        }
                    }
                }

                setAllProductsByDepartment(newDepartments);

                response.is_active
                    ? notifySuccess("Oferta habilitada nuevamente")
                    : notifyWarning("La oferta ha sido deshabilitada y no se está aplicando");
            } else {
                notifyError("No se ha podido cambiar el estado a la oferta");
            }
        }

        const OfferItem = ({ item, index, currency, depotId }: { item: any, index: number, currency: string, depotId: number }) => (
            <Grid container item xs={12}>
                <Grid
                    container
                    item
                    columnSpacing={1}
                    maxWidth={"80vw"}
                    sx={{
                        width: 'fit-content',
                        backgroundColor: "lightgray",
                        padding: "2px 4px",
                        borderRadius: "5px 2px 2px 2px",
                        border: "1px solid",
                        borderColor: item.is_active ? "seagreen" : "orange",
                        fontSize: 14,
                        cursor: "pointer",
                        textDecorationLine: item.is_active ? "none" : "line-through",
                    }}
                >
                    <Grid container item xs={12} justifyContent={"space-between"}>
                        <Checkbox
                            size={"small"}
                            color={item.is_active ? "success" : "default"}
                            checked={item.is_active}
                            onClick={async (e) => {
                                return await handleToggleOffer(item.id, depotId);
                            }}
                        />
                    </Grid>

                    <Grid
                        container
                        item
                        xs={12}
                        sx={{ color: "rgba(16,27,44,0.8)", textWrap: "pretty" }}>
                        {
                            item.compare_function === '='
                                ? `${index + 1}. Cuando compren ${item.compare_units_quantity} unidades de este producto, cada unidad tendrá un precio de ${item.price_per_unit} ${currency}`
                                : `${index + 1}. Cuando compren más de ${item.compare_units_quantity} unidades de este producto, cada unidad tendrá un precio de ${item.price_per_unit} ${currency}`
                        }
                    </Grid>
                </Grid>
            </Grid>
        )

        const productHasActiveOffer = (offers: product_offers[]) => {
            return offers.some((offer: product_offers) => offer.is_active);
        }

        return (
            <TableBody>
                {dataProducts?.filter(
                    (product: productsProps) =>
                        product?.name?.toUpperCase().includes(searchBarValue.toUpperCase()) ||
                        product?.description?.toUpperCase().includes(searchBarValue.toUpperCase())
                )
                    .map(
                        (product: productsProps) => {
                            const baseProductPrice = (!product.depots![0].store_depots![0].sell_price || product.depots![0].store_depots![0].sell_price === "0")
                                ? null
                                : numberFormat(product.depots![0].store_depots![0].sell_price);

                            const priceDiscountQuantity = baseProductPrice
                                ? product.depots![0].store_depots![0].price_discount_percentage
                                    ? product.depots![0].store_depots![0].price_discount_percentage * parseFloat(String(baseProductPrice)) / 100
                                    : product.depots![0].store_depots![0].price_discount_quantity
                                : null;

                            const finalProductPrice = baseProductPrice && priceDiscountQuantity
                                ? (parseFloat(String(baseProductPrice)) - priceDiscountQuantity)
                                : baseProductPrice;

                            const sellerProfitQuantity = finalProductPrice
                                ? product.depots![0].store_depots![0].seller_profit_percentage
                                    ? product.depots![0].store_depots![0].seller_profit_percentage * finalProductPrice / 100
                                    : product.depots![0].store_depots![0].seller_profit_quantity
                                : null;

                            const displayProductPrice = finalProductPrice
                                ? `${numberFormat(String(finalProductPrice)) + " " + product.depots![0].store_depots![0].sell_price_unit}`
                                : "sin precio";

                            const displayPriceDiscount = baseProductPrice
                                ? product.depots![0].store_depots![0].price_discount_percentage
                                    ? numberFormat(`${product.depots![0].store_depots![0].price_discount_percentage}`) + " %"
                                    : product.depots![0].store_depots![0].price_discount_quantity
                                        ? numberFormat(`${product.depots![0].store_depots![0].price_discount_quantity}`) + " " + product.depots![0].store_depots![0].sell_price_unit
                                        : null
                                : null;

                            return (
                                <React.Fragment key={product.id}>
                                    <TableRow
                                        hover
                                        tabIndex={-1}
                                        selected={!!selectedProducts.find((productSelected: productsProps) => productSelected.id === product.id)}
                                        onClick={() => handleExpandRow(product.id)}
                                    >
                                        <TableCell sx={{ padding: 0 }}>
                                            <Checkbox
                                                size='small'
                                                checked={!!selectedProducts.find((productSelected: productsProps) => productSelected.id === product.id)}
                                                disabled={!product.depots![0].store_depots![0].is_active ||
                                                    !product.depots![0].store_depots![0].product_remaining_units}
                                                onClick={(e) => handleSelectItem(e, product)}
                                            />

                                            <IconButton size={"small"}>
                                                {
                                                    (expandIndex !== product.id)
                                                        ? <ExpandMoreOutlined />
                                                        : <ExpandLessOutlined />
                                                }
                                            </IconButton>
                                        </TableCell>

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
                                            <Box display={"flex"} justifyContent={"center"}>{product.name}</Box>
                                        </TableCell>

                                        <TableCell align="center" padding={"none"}>
                                            <Circle color={product.depots![0].store_depots![0].is_active ? "success" : "warning"} />
                                        </TableCell>

                                        <TableCell>
                                            <Grid container rowSpacing={1}>
                                                <Grid container item xs={12} flexWrap={"nowrap"} alignItems={"center"}>
                                                    <MoneyInfoTag
                                                        value={displayProductPrice}
                                                        errorColor={!baseProductPrice}
                                                    />
                                                    {
                                                        !!product?.depots![0].store_depots![0].product_offers?.length &&
                                                        productHasActiveOffer(product?.depots![0].store_depots![0].product_offers) && (
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
                                                                tooltipText={product?.depots![0].store_depots![0].discount_description}
                                                            />
                                                        </Grid>
                                                    )
                                                }
                                            </Grid>
                                        </TableCell>
                                        <TableCell align="center">
                                            <Box
                                                sx={
                                                    {
                                                        display: "inline-flex",
                                                        justifyContent: "center",
                                                        alignItems: "center",
                                                        padding: "2px 4px",
                                                        color: "darkblue",
                                                        backgroundColor: "lightgrey",
                                                        borderRadius: "6px",
                                                        border: "1px solid black",
                                                        fontSize: "18px"
                                                    }
                                                }>
                                                {product.depots![0].store_depots![0].product_remaining_units}
                                            </Box>
                                        </TableCell>
                                        <TableCell>
                                            {
                                                product.depots![0].store_depots![0].is_active &&
                                                !!product.depots![0].store_depots![0].product_remaining_units && (
                                                    <Grid container>
                                                        <IconButton
                                                            color={"primary"}
                                                            onClick={(e) => handleOpenConfirmDialog(e, product)}
                                                        >
                                                            <SellOutlined fontSize={"small"} />
                                                        </IconButton>
                                                    </Grid>
                                                )
                                            }
                                        </TableCell>
                                    </TableRow>

                                    <TableRow>
                                        <TableCell style={{ padding: 0 }} colSpan={6}>
                                            <Collapse in={expandIndex === product.id} timeout="auto" unmountOnExit>
                                                <Grid container spacing={1} sx={{ padding: "8px 26px" }}>
                                                    <Grid item xs={12}>
                                                        <Typography variant="subtitle1" gutterBottom component="div">
                                                            Detalles:
                                                        </Typography>
                                                    </Grid>

                                                    <Grid container item spacing={1} xs={12}>
                                                        <Grid item xs={"auto"} sx={{ fontWeight: 600 }}>Producto:</Grid>
                                                        <Grid item xs={true}>
                                                            {product.name}
                                                        </Grid>
                                                    </Grid>

                                                    <Grid container item spacing={1} xs={12}>
                                                        <Grid item xs={"auto"} sx={{ fontWeight: 600 }}>Descripción:</Grid>
                                                        <Grid item xs={true}>
                                                            {product.description ? product.description : "-"}
                                                        </Grid>
                                                    </Grid>

                                                    <Grid container item spacing={1} xs={12}>
                                                        <Grid item xs={"auto"} sx={{ fontWeight: 600 }}>Estado:</Grid>
                                                        <Grid container item xs={true}>
                                                            <Typography variant={"button"}>
                                                                {product.depots![0].store_depots![0].is_active
                                                                    ? "en venta"
                                                                    : "inactivo"
                                                                }
                                                            </Typography>

                                                            <Switch
                                                                size={"small"}
                                                                color={"success"}
                                                                disabled={!baseProductPrice}
                                                                checked={product.depots![0].store_depots![0].is_active!}
                                                                onClick={(e) => handleToggleIsActive(e, product.id, product.depots![0].store_depots![0].id)}
                                                            />
                                                        </Grid>
                                                    </Grid>

                                                    <Grid container item spacing={1} xs={12}>
                                                        <Grid container item xs={"auto"} alignItems={"center"} sx={{ fontWeight: 600 }}>Propiedades:</Grid>
                                                        <Grid container item xs={true} alignItems={"center"}>
                                                            <StoreDepotPropertiesManage
                                                                data={product}
                                                                updateFunction={updateStoreDepotProperties}
                                                            />
                                                        </Grid>
                                                    </Grid>

                                                    <Grid container item spacing={1} xs={12}>
                                                        <Grid item xs={"auto"} sx={{ fontWeight: 600 }}>Departamento:</Grid>
                                                        <Grid item xs={true}>{product.departments?.name ?? "-"}</Grid>
                                                    </Grid>

                                                    <Grid container item spacing={1} xs={12}>
                                                        <Grid item xs={"auto"} sx={{ fontWeight: 600, display: "flex", alignItems: "center" }}>Características:</Grid>
                                                        <Grid item xs={true} sx={{ display: "flex", alignItems: "center" }}>
                                                            {product.characteristics?.length! > 0
                                                                ? product.characteristics?.map((item: any) => (
                                                                    <Box key={item.id} display={"inline-flex"} mr={"5px"}>
                                                                        {`${item.name.toUpperCase()} = ${item.value}`}
                                                                    </Box>
                                                                )) : "-"
                                                            }
                                                        </Grid>
                                                    </Grid>

                                                    <Grid container item spacing={1} xs={12}>
                                                        <Grid item xs={"auto"} sx={{ fontWeight: 600 }}>Precio
                                                            base:</Grid>
                                                        <Grid item xs={true}>
                                                            {
                                                                baseProductPrice
                                                                    ? baseProductPrice + " " + product.depots![0].store_depots![0].sell_price_unit
                                                                    : "sin precio"
                                                            }
                                                        </Grid>
                                                    </Grid>

                                                    <Grid container item spacing={1} xs={12}>
                                                        <Grid item xs={"auto"} sx={{ fontWeight: 600 }}>Precio:</Grid>
                                                        <Grid item xs={true}>
                                                            {displayProductPrice}
                                                            {
                                                                priceDiscountQuantity && (
                                                                    <span>{`- ${displayPriceDiscount} descuento`}</span>
                                                                )
                                                            }
                                                        </Grid>
                                                    </Grid>

                                                    {
                                                        product?.depots![0].store_depots![0].discount_description && (
                                                            <Grid container item spacing={1} xs={12}>
                                                                <Grid item xs={"auto"} sx={{ fontWeight: 600 }}>Razón de la rebaja:</Grid>
                                                                <Grid item xs={true}>
                                                                    {product?.depots![0].store_depots![0].discount_description}
                                                                </Grid>
                                                            </Grid>
                                                        )
                                                    }

                                                    <Grid container item columnSpacing={1} xs={12}>
                                                        <Grid item xs={"auto"} sx={{ fontWeight: 600 }}>Salario del vendedor:</Grid>
                                                        <Grid item container xs={true}>
                                                            {
                                                                product?.depots![0].store_depots![0].seller_profit_percentage
                                                                    ? `${product?.depots![0].store_depots![0].seller_profit_percentage} %`
                                                                    : product?.depots![0].store_depots![0].seller_profit_quantity
                                                                        ? `${product?.depots![0].store_depots![0].seller_profit_quantity} CUP`
                                                                        : "-"
                                                            }
                                                        </Grid>
                                                    </Grid>

                                                    <Grid container item spacing={1} xs={12}>
                                                        <Grid item xs={"auto"}
                                                            sx={{ fontWeight: 600 }}>Distribución:</Grid>
                                                        <Grid item xs={true}>
                                                            {
                                                                (baseProductPrice && sellerProfitQuantity && finalProductPrice)
                                                                    ? `Dueño: ${numberFormat(String(finalProductPrice - sellerProfitQuantity))} | Vendedor: ${numberFormat(`${sellerProfitQuantity}`)}`
                                                                    : "-"
                                                            }
                                                        </Grid>
                                                    </Grid>

                                                    <Grid container item spacing={1} xs={12}>
                                                        <Grid item container xs={"auto"} sx={{ fontWeight: 600 }} alignItems={"center"}>Unidades restantes:</Grid>
                                                        <Grid item container xs={true} alignItems={"center"}>
                                                            {product.depots![0].store_depots![0].product_remaining_units}
                                                        </Grid>
                                                    </Grid>

                                                    <Grid container item spacing={1} xs={12}>
                                                        <Grid item xs={12} sx={{ fontWeight: 600 }}>Ofertas:</Grid>
                                                        <Grid container item xs={12} rowSpacing={1}>
                                                            {product.depots![0].store_depots![0].product_offers?.map((item: any, index: number) => (
                                                                <OfferItem
                                                                    item={item}
                                                                    index={index}
                                                                    currency={product.depots![0].store_depots![0].sell_price_unit!}
                                                                    depotId={product.depots![0].store_depots![0].id}
                                                                    key={item.id}
                                                                />
                                                            ))}
                                                        </Grid>
                                                    </Grid>
                                                </Grid>
                                            </Collapse>
                                        </TableCell>
                                    </TableRow>
                                </React.Fragment>
                            )
                        })}
            </TableBody>
        )
    }

    const initialValues = {
        searchBarValue: "",
        onSellFilter: false,
        inactiveFilter: false,
        withOutPriceFilter: false,
        withDiscountFilter: false,
        withOffersFilter: false,
        withoutDisponibilityFilter: false,
        disponibilityLessThan10Filter: false,
        disponibilityLessThan20Filter: false,
    }

    const [isModalProductSellOpen, setIsModalProductSellOpen] = useState<boolean>(false);
    const [isModalProductSellReceivableOpen, setIsModalProductSellReceivableOpen] = useState<boolean>(false);

    const loadData = async () => {
        let selectedDepartment = new Map();

        allProductsByDepartment?.forEach((productsByDepartments) => {
            if (productsByDepartments.selected) selectedDepartment.set(productsByDepartments.id, true);
        })

        const newAllProductByDepartments: allProductsByDepartmentProps[] | null = await sellerStoreProduct.allProductByDepartments(storeId!);

        if (newAllProductByDepartments) {
            setAllProductsByDepartment(
                newAllProductByDepartments.map((productsByDepartments: allProductsByDepartmentProps) => ({
                    ...productsByDepartments,
                    selected: selectedDepartment.has(productsByDepartments.id) ? true : false
                })));
        }
        setActiveModalTransfer(false);
    }

    return (
        <Formik
            initialValues={initialValues}
            onSubmit={() => { }}
        >
            {
                (formik) => (
                    <Card variant={"outlined"}>
                        <>
                            {isFilterDepartmentsModalOpen && (allProductsByDepartment!.length! > 0)
                                && <FilterProductsByDepartmentsModal
                                    allProductsByDepartment={allProductsByDepartment!}
                                    setAllProductsByDepartment={setAllProductsByDepartment}
                                    setFiltersApplied={setFiltersDeparmentsApplied}
                                    isFilterModalOpen={isFilterDepartmentsModalOpen}
                                    toggleModalFilter={toggleModalDepartmentsFilter}
                                />}

                            {isFilterConditionsModalOpen && (allProductsByDepartment?.length! > 0)
                                && <FilterProductsByConditionsModal
                                    setFilteredConditions={setFilteredConditions}
                                    formik={formik}
                                    setFiltersApplied={setFiltersConditionsApplied}
                                    isFilterModalOpen={isFilterConditionsModalOpen}
                                    toggleModalFilter={toggleModalConditionsFilter}
                                />}

                            <ImagesDisplayDialog
                                open={openImageDialog}
                                setOpen={setOpenImagesDialog}
                                images={dialogImages}
                            />

                            <ConfirmDeleteDialog
                                open={openConfirmDialog}
                                handleClose={handleCloseConfirmDialog}
                                title={"Confirmar acción"}
                                message={`Confirma vender "${sellProductItem?.name}" con precio ${sellProductItem?.depots[0]?.store_depots[0]?.sell_price} ${sellProductItem?.depots[0]?.store_depots[0]?.sell_price_unit}`}
                                confirmAction={handleSellProduct}
                            />
                            {
                                isModalProductSellOpen && (
                                    <ProductSellForm
                                        storeId={storeId!}
                                        isModalOpen={isModalProductSellOpen}
                                        allProductsByDepartment={allProductsByDepartment!}
                                        setAllProductsByDepartment={setAllProductsByDepartment!}
                                        setIsOpen={setIsModalProductSellOpen}
                                        selectedProducts={selectedProducts}
                                        setSelectedProducts={setSelectedProducts}
                                    />
                                )
                            }
                            {
                                isModalProductSellReceivableOpen && (
                                    <ProductSellForm
                                        storeId={storeId!}
                                        isModalOpen={isModalProductSellReceivableOpen}
                                        allProductsByDepartment={allProductsByDepartment!}
                                        setAllProductsByDepartment={setAllProductsByDepartment!}
                                        setIsOpen={setIsModalProductSellReceivableOpen}
                                        selectedProducts={selectedProducts}
                                        isReceivable
                                        setSelectedProducts={setSelectedProducts}
                                    />
                                )
                            }

                            <ModalTransfer
                                open={activeModalTransfer}
                                setOpen={setActiveModalTransfer}
                                dialogTitle="Transferir a tienda"
                            >
                                {
                                    activeModalTransfer &&
                                    <TransferBetweenStores
                                        storeId={storeId!}
                                        storeDepot={productSelectedForTransfer?.depots![0].store_depots![0]!}
                                        badItem={productSelectedForTransfer?.id!}
                                        cancelChecked={cancelChecked}
                                        loadData={loadData}
                                    />
                                }
                            </ModalTransfer>
                        </>
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
                                            message={"Puede buscar por nombre y descripción ó filtrar por departamentos o condiciones"}
                                        >
                                            <IconButton onClick={handleTooltipOpen}>
                                                <HelpOutline />
                                            </IconButton>
                                        </InfoTooltip>
                                    </Grid>
                                </Grid>
                                <Grid container spacing={2} alignItems="center">
                                    <Grid item md={12} mx={"auto"}>
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
                                    <Grid item container xs={12}>
                                        <Card variant="outlined" sx={{ padding: "10px", marginTop: "5px", overflow: "visible", width: "100%" }}>
                                            <Typography component={"span"} sx={{ marginTop: "-22px", display: "flex", width: "128px", paddingX: "6px", backgroundColor: "white" }}>
                                                Aplicar filtros por:
                                            </Typography>
                                            <Grid item container xs={12} justifyContent={"space-between"} marginTop={"5px"}>
                                                <Grid item xs={6}>
                                                    <Button size="small"
                                                        sx={{
                                                            color: grey[600],
                                                            borderColor: grey[600],
                                                            '&:hover': {
                                                                borderColor: grey[800],
                                                                backgroundColor: grey[200],
                                                            },
                                                        }}
                                                        onClick={toggleModalDepartmentsFilter} startIcon={<FilterAlt />} variant="outlined">Departamentos</Button>
                                                </Grid>
                                                <Grid item xs={5}>
                                                    <Button size="small"
                                                        sx={{
                                                            color: grey[600],
                                                            borderColor: grey[600],
                                                            '&:hover': {
                                                                borderColor: grey[800],
                                                                backgroundColor: grey[200],
                                                            },
                                                        }}
                                                        onClick={toggleModalConditionsFilter} startIcon={<FilterAlt />} variant="outlined">Condiciones</Button>
                                                </Grid>
                                            </Grid>
                                        </Card>
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
                                                    product?.description?.toUpperCase().includes(formik.values.searchBarValue.toUpperCase())
                                            ).length! > 0 ?
                                                <>
                                                    {
                                                        selectedProducts.length > 0 && (
                                                            <Grid container rowSpacing={1} sx={{ mb: "5px", px: "5px" }}>
                                                                <Grid item xs={12}>
                                                                    {selectedProducts.length > 1 ? "Seleccionados" : "Seleccionado"}: {selectedProducts.length}
                                                                </Grid>

                                                                <Grid container item xs={12} columnSpacing={1} flexWrap={"nowrap"}>
                                                                    <Grid container item columnSpacing={1} flexWrap={"nowrap"} sx={{ overflowX: "auto" }}>
                                                                        <Grid item xs={"auto"}>
                                                                            <Button
                                                                                size={"small"}
                                                                                color={"primary"}
                                                                                variant={"outlined"}
                                                                                onClick={() => setIsModalProductSellOpen(true)}
                                                                                startIcon={<SellOutlined fontSize={"small"} />}
                                                                            >
                                                                                Vender
                                                                            </Button>
                                                                        </Grid>

                                                                        {
                                                                            selectedProducts.length === 1 && (
                                                                                <Grid item xs={"auto"}>
                                                                                    <Button
                                                                                        size={"small"}
                                                                                        variant={"outlined"}
                                                                                        startIcon={<ForwardToInbox color="secondary" />}
                                                                                        onClick={() => handleClickTransfer(selectedProducts[0])}
                                                                                    >
                                                                                        Transferir
                                                                                    </Button>
                                                                                </Grid>
                                                                            )
                                                                        }

                                                                        <Grid item xs={"auto"}>
                                                                            <Button
                                                                                size={"small"}
                                                                                color={"primary"}
                                                                                variant={"outlined"}
                                                                                onClick={() => setIsModalProductSellReceivableOpen(true)}
                                                                                startIcon={<SellRounded fontSize={"small"} />}
                                                                            >
                                                                                Venta por cobrar
                                                                            </Button>
                                                                        </Grid>
                                                                    </Grid>

                                                                    <Grid item xs={true}>
                                                                        <IconButton
                                                                            size={"small"}
                                                                            color="error"
                                                                            onClick={() => setSelectedProducts([])}
                                                                        >
                                                                            <FilterAltOff fontSize={"small"} />
                                                                        </IconButton>
                                                                    </Grid>
                                                                </Grid>
                                                            </Grid>
                                                        )
                                                    }
                                                    <TableContainer sx={{ width: "100%", maxHeight: "500px" }}>
                                                        <Table sx={{ width: "100%" }} size={"small"}>
                                                            <TableHeader />
                                                            <TableContent formik={formik} />
                                                        </Table>
                                                    </TableContainer>
                                                </>
                                                : <TableNoData searchCoincidence />
                                            ) : (
                                                <TableNoData searchCoincidence={filtersConditionsApplied && dataProducts?.length! === 0} />
                                            )
                                    }
                                </Grid>
                            </Card>
                        </CardContent >
                    </Card >
                )
            }
        </Formik >
    )
}

export default StoreActionsMain