"use client"

import {
    AppBar, Avatar, AvatarGroup, Box, Button, Card, CardContent,
    Collapse, DialogActions, Divider, Grid, IconButton, InputBase,
    Table, TableBody, TableCell, TableContainer, TableHead,
    TableRow, TextField, Toolbar, Typography
} from "@mui/material";
import {
    Add, AddOutlined, ArrowLeft, ChevronRightOutlined,
    Done, EditOutlined, ExpandLessOutlined, ExpandMoreOutlined,
    FilterAlt, HelpOutline, ShareOutlined,
} from "@mui/icons-material";
import { UserWarehouseMainTableProps, allProductsByDepartmentProps, productsProps, storeDepotsWithAny } from "@/types/interfaces";
import FilterProductsByDepartmentsModal from "@/components/modals/FilterProductsByDepartmentsModal";
import ImagesDisplayDialog from "@/components/ImagesDisplayDialog";
import UpdateValueDialog from "@/components/UpdateValueDialog";
import warehouseDepots from "../requests/warehouseDepots";
import { TableNoData } from "@/components/TableNoData";
import { handleKeyDown } from "@/utils/handleKeyDown";
import tableStyles from "@/assets/styles/tableStyles";
import UserWarehouseForm from "./UserWarehouseForm";
import SearchIcon from '@mui/icons-material/Search';
import React, { useEffect, useState } from "react";
import InfoTooltip from "@/components/InfoTooltip";
import { depots, images } from "@prisma/client";
import ModalAddProduct from "./ModalAddProduct";
import { grey } from "@mui/material/colors";
import { useRouter } from "next/navigation";
import { AxiosResponse } from "axios";
import { Formik } from "formik";
import * as Yup from "yup";
import dayjs from "dayjs";

const UserWarehouseMainTable = ({ userId, ownerId, warehouseDetails }: UserWarehouseMainTableProps) => {
    const router = useRouter();

    const [dataProducts, setDataProducts] = useState<productsProps[] | null>(null);
    const [allProductsByDepartment, setAllProductsByDepartment] = useState<allProductsByDepartmentProps[] | null>(null);
    const [filtersApplied, setFiltersApplied] = useState<boolean>(false);

    const [activeModalAddProduct, setActiveModalAddProduct] = useState(false);

    const [isFilterModalOpen, setIsFilterModalOpen] = useState<boolean>(false);
    const toggleModalFilter = () => {
        if (!dataProducts) return;
        setIsFilterModalOpen(!isFilterModalOpen);
    }

    const [isOpenTooltip, setIsOpenTooltip] = useState<boolean>(false);
    const handleTooltipClose = () => setIsOpenTooltip(false);
    const handleTooltipOpen = () => setIsOpenTooltip(true);

    const [openImagesDialog, setOpenImagesDialog] = useState<boolean>(false);
    const [dialogImages, setDialogImages] = useState<images[] | null>(null);

    const handleOpenImagesDialog = (images: images[]) => {
        setDialogImages(images);
        setOpenImagesDialog(true);
    }

    //GET initial products data
    useEffect(() => {
        const getAllProductsByDepartment = async () => {
            const newAllProductsByDepartment: allProductsByDepartmentProps[] | null = await warehouseDepots.allDepots(+ownerId!, +warehouseDetails?.id!);
            if (newAllProductsByDepartment) {
                setAllProductsByDepartment(newAllProductsByDepartment.map((productsByDepartments: allProductsByDepartmentProps) => ({
                    ...productsByDepartments,
                    selected: false
                })));
            }
        }
        getAllProductsByDepartment();
    }, [ownerId, warehouseDetails]);

    const reloadData = async () => {
        let newAllProductsByDepartment: allProductsByDepartmentProps[] | null = await warehouseDepots.allDepots(+ownerId!, +warehouseDetails?.id!);
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
        } else {
            setDataProducts(null);
        }
    }, [allProductsByDepartment, filtersApplied]);

    const initialValues = {
        searchBarValue: "",
        productNewUnitsQuantity: 0,
        productUpdateUnitsQuantity: {
            newTotal: "",
            newRemaining: "",
        },
        productStoreDepotDistribution: {
            warehouseQuantity: "",
            storeQuantity: "",
            moveFromWarehouseToStoreQuantity: "",
            moveFromStoreToWarehouseQuantity: "",
        },
    }

    const validationSchema = Yup.object({
        searchBarValue: Yup.string(),
        productNewUnitsQuantity: Yup.number().integer().typeError("Tiene que ser un número entero").min(0, "Tiene que ser mayor que cero"),
        productStoreDepotDistribution: Yup.object({
            warehouseQuantity: Yup.number().integer().typeError("Tiene que ser un número entero").min(0, "Tiene que ser mayor que cero"),
            storeQuantity: Yup.number().integer().typeError("Tiene que ser un número entero").min(0, "Tiene que ser mayor que cero").nullable(),
            moveFromWarehouseToStoreQuantity: Yup
                .number().integer().typeError("Tiene que ser un número entero")
                .min(0, "Tiene que ser mayor que cero")
                .max(Yup.ref("warehouseQuantity"), "No existe esa cantidad en el almacén"),
            moveFromStoreToWarehouseQuantity: Yup
                .number().integer().typeError("Tiene que ser un número entero")
                .min(0, "Tiene que ser mayor que cero")
                .max(Yup.ref("storeQuantity"), "No existe esa cantidad en la tienda")
        })
    })

    //SELECT product in table
    const [selectedProduct, setSelectedProduct] = useState<productsProps | null>(null);

    const handleNavigateBack = () => router.push('/inventory');

    const handleStoreAssign = () => {
        router.push(`/inventory/keeper/store-assign?warehouseId=${warehouseDetails?.id}`)
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
                            letterSpacing: "0.15rem",
                            color: "white",
                        }}
                    >
                        Depósitos
                    </Typography>
                </Box>

                <Box sx={{ display: "flex" }}>
                    <IconButton color={"inherit"} onClick={handleStoreAssign}>
                        <ShareOutlined fontSize={"small"} />
                    </IconButton>

                    <IconButton color={"inherit"} sx={{ color: 'white' }} onClick={() => setActiveModalAddProduct(true)} >
                        <AddOutlined />
                    </IconButton>
                </Box>
            </Toolbar>
        </AppBar >
    )

    const [displayUpdateDepotQuantityForm, setDisplayUpdateDepotQuantityForm] = useState<boolean>(false);
    const [storeDepotUpdateIndex, setStoreDepotUpdateIndex] = useState<number | null>(null);
    const [displayNewUnitsForm, setDisplayNewUnitsForm] = useState<boolean>(false);

    const afterUpdateDepot = (updatedDepot: AxiosResponse) => {
        const newDepots = [...allProductsByDepartment!];

        for (const productsByDepartments of allProductsByDepartment!) {
            const productsByDepartmentsIndex = newDepots.indexOf(productsByDepartments);

            const updatedIndex = productsByDepartments.products?.findIndex(productItem => productItem.depots![0].id === updatedDepot.data.id)
            if (updatedIndex! > -1) {
                newDepots[productsByDepartmentsIndex].products![updatedIndex!].depots![0].product_total_units = updatedDepot.data.product_total_units;
                newDepots[productsByDepartmentsIndex].products![updatedIndex!].depots![0].product_total_remaining_units = updatedDepot.data.product_total_remaining_units;

                setAllProductsByDepartment(newDepots);
                break;
            }
        }
    }

    const NewUnitsQuantityForm = ({ formik }: any) => {
        async function handleNewUnitsAdd() {
            const updatedDepot: AxiosResponse | boolean = await warehouseDepots.increaseUnitsDepot(
                {
                    ownerId: +ownerId!,
                    warehouseId: +warehouseDetails?.id!,
                    depotId: +selectedProduct?.depots![0].id!,
                    newUnits: +formik.values.productNewUnitsQuantity
                }
            )

            if (!updatedDepot) return;

            if (updatedDepot?.data?.id) {
                afterUpdateDepot(updatedDepot);
                setDisplayNewUnitsForm(false);
            }
        }
        const handleClose = () => {
            !!formik && formik.resetForm();
            setDisplayNewUnitsForm(false);
        };

        return (
            <Grid container item spacing={2}>
                <Grid item>
                    <TextField
                        name={"productNewUnitsQuantity"}
                        label="Nuevas unidades"
                        size={"small"}
                        onKeyDown={handleKeyDown}
                        inputMode="numeric"
                        {...formik.getFieldProps("productNewUnitsQuantity")}
                        error={formik.errors.productNewUnitsQuantity && formik.touched.productNewUnitsQuantity}
                        helperText={(formik.errors.productNewUnitsQuantity && formik.touched.productNewUnitsQuantity) && formik.errors.productNewUnitsQuantity}
                    />
                </Grid>
                <Grid container item justifyContent={"flex-end"}>
                    <DialogActions >
                        <Button color="error" variant="outlined" onClick={handleClose}>Cerrar</Button>
                        <Button
                            onClick={handleNewUnitsAdd}
                            color="primary"
                            disabled={!formik.values.productNewUnitsQuantity}
                            variant="outlined">Aceptar
                        </Button>
                    </DialogActions>
                </Grid>
            </Grid>
        )
    }

    const UpdateStoreDepotQuantityForm = ({ formik }: any) => {
        const { warehouseQuantity, storeQuantity, moveQuantity } = formik.values.productStoreDepotDistribution;

        function updateLocalData(updatedDepot: depots, updatedStoreDepot: storeDepotsWithAny) {
            const newDepots = [...allProductsByDepartment!];

            for (const productsByDepartments of allProductsByDepartment!) {
                const departmentProducts = productsByDepartments.products;
                const productsByDepartmentsIndex = newDepots.indexOf(productsByDepartments);

                //find updatedDepot
                const updatedIndex = departmentProducts?.findIndex(productItem => productItem.depots![0].id === updatedDepot.id);
                if (updatedIndex! > -1) {
                    //update depot data
                    departmentProducts![updatedIndex!].depots![0].product_total_remaining_units = updatedDepot.product_total_remaining_units;
                    //find updated store_depot
                    const updatedStoreDepotIndex = departmentProducts![updatedIndex!].storesDistribution?.
                        findIndex(storeItem => storeItem.id === updatedStoreDepot.store_id);

                    if (updatedStoreDepotIndex! > - 1) {
                        newDepots[productsByDepartmentsIndex].products![updatedIndex!].storesDistribution![updatedStoreDepotIndex!].store_depots![0] = updatedStoreDepot;
                    }
                    setAllProductsByDepartment(newDepots);
                    break
                }
            }
        }

        async function handleMoveToStore() {
            const updateResponse = await warehouseDepots.sendDepotFromWarehouseToStore(
                {
                    userId: +userId!,
                    warehouseId: +warehouseDetails?.id!,
                    depotId: +selectedProduct?.depots![0].id!,
                    storeDepotId: +selectedProduct?.storesDistribution![storeDepotUpdateIndex!]?.store_depots![0]?.id! ?? null,
                    storeId: +selectedProduct?.storesDistribution![storeDepotUpdateIndex!].id!,
                    moveUnitQuantity: +formik.values.productStoreDepotDistribution.moveFromWarehouseToStoreQuantity,
                }
            )

            if (updateResponse?.updatedDepot && updateResponse?.updatedStoreDepot) {
                updateLocalData(updateResponse.updatedDepot, updateResponse.updatedStoreDepot)

                formik.resetForm();

                setDisplayUpdateDepotQuantityForm(false);
            }
        }

        async function handleMoveToWarehouse() {
            const updateResponse = await warehouseDepots.sendDepotFromStoreToWarehouse(
                {
                    userId: +userId!,
                    warehouseId: +warehouseDetails?.id!,
                    depotId: +selectedProduct?.depots![0].id!,
                    storeDepotId: +selectedProduct?.storesDistribution![storeDepotUpdateIndex!].store_depots![0].id!,
                    moveUnitQuantity: +formik.values.productStoreDepotDistribution.moveFromStoreToWarehouseQuantity,
                }
            );

            if (updateResponse?.updatedDepot && updateResponse?.updatedStoreDepot) {
                updateLocalData(updateResponse.updatedDepot, updateResponse.updatedStoreDepot)

                formik.resetForm();

                setDisplayUpdateDepotQuantityForm(false);
            }
        }

        return (
            <Grid container item spacing={2}>
                <Grid item xs={12}>
                    Mover de almacén hacia tienda: {warehouseQuantity} disponibles
                </Grid>
                <Grid item container alignItems="center" xs={12} md={8}>
                    <Grid item xs={10} md={6}>
                        <TextField
                            name={"productStoreDepotDistribution"}
                            label={"Enviar a tienda"}
                            color={"primary"}
                            inputMode="numeric"
                            size={"small"}
                            onKeyDown={handleKeyDown}
                            {...formik.getFieldProps("productStoreDepotDistribution.moveFromWarehouseToStoreQuantity")}
                            error={
                                formik.errors.productStoreDepotDistribution?.moveFromWarehouseToStoreQuantity &&
                                formik.touched.productStoreDepotDistribution?.moveFromWarehouseToStoreQuantity
                            }
                            helperText={
                                (
                                    formik.errors.productStoreDepotDistribution?.moveFromWarehouseToStoreQuantity &&
                                    formik.touched.productStoreDepotDistribution?.moveFromWarehouseToStoreQuantity
                                ) && formik.errors.productStoreDepotDistribution.moveFromWarehouseToStoreQuantity
                            }
                        />
                    </Grid>
                    <Grid item xs={2} md={6}>
                        <IconButton
                            color={"primary"}
                            onClick={handleMoveToStore}
                            sx={{ ml: "10px" }}
                            disabled={!!formik.errors.productStoreDepotDistribution?.moveFromWarehouseToStoreQuantity
                                || formik.values.productStoreDepotDistribution.moveFromWarehouseToStoreQuantity == 0 ? true : false}
                        >
                            <Done />
                        </IconButton>
                    </Grid>
                </Grid>
                {
                    !!storeQuantity && (
                        <>
                            <Grid item xs={12}>
                                <Divider flexItem sx={{ width: 1 }} />
                            </Grid>

                            <Grid item xs={12}>
                                Retirar de tienda hacia el almacén: {storeQuantity} disponibles
                            </Grid>

                            <Grid item container alignItems="center" xs={12} md={8}>
                                <Grid item xs={10} md={6}>
                                    <TextField
                                        name={"productStoreDepotDistribution"}
                                        label={"Retirar de tienda"}
                                        color={"secondary"}
                                        inputMode="numeric"
                                        size={"small"}
                                        onKeyDown={handleKeyDown}
                                        {...formik.getFieldProps("productStoreDepotDistribution.moveFromStoreToWarehouseQuantity")}
                                        error={
                                            formik.errors.productStoreDepotDistribution?.moveFromStoreToWarehouseQuantity &&
                                            formik.touched.productStoreDepotDistribution?.moveFromStoreToWarehouseQuantity
                                        }
                                        helperText={
                                            (
                                                formik.errors.productStoreDepotDistribution?.moveFromStoreToWarehouseQuantity &&
                                                formik.touched.productStoreDepotDistribution?.moveFromStoreToWarehouseQuantity
                                            ) && formik.errors.productStoreDepotDistribution.moveFromStoreToWarehouseQuantity
                                        }
                                    />
                                </Grid>
                                <Grid item xs={2} md={6}>
                                    <IconButton
                                        color={"secondary"}
                                        onClick={handleMoveToWarehouse}
                                        sx={{ ml: "10px" }}
                                        disabled={!!formik.errors.productStoreDepotDistribution?.moveFromStoreToWarehouseQuantity
                                            || formik.values.productStoreDepotDistribution.moveFromStoreToWarehouseQuantity == 0 ? true : false}
                                    >
                                        <Done />
                                    </IconButton>
                                </Grid>
                            </Grid>
                        </>
                    )
                }
            </Grid>
        )
    }

    const TableHeader = () => {
        const headCells = [
            {
                id: "details",
                label: "",
                padding: "checkbox",
            },
            {
                id: "name",
                label: "Nombre",
            },
            {
                id: "department",
                label: "Departamento",
            },
            {
                id: "units",
                label: "Unidades",
            },
        ]

        return (
            <TableHead>
                <TableRow>
                    {headCells.map(headCell => (
                        <TableCell
                            key={headCell.id}
                            // @ts-ignore
                            padding={headCell.padding ? headCell.padding : 'normal'}
                            align={"center"}
                        >
                            {headCell.label}
                        </TableCell>
                    ))}
                </TableRow>
            </TableHead>
        )
    }

    async function handleLoadStoresDistribution(depot: depots) {
        const response = await warehouseDepots.depotStoreDistribution(+ownerId!, +warehouseDetails?.id!, +depot.id!);

        if (response) {
            const newAllProductsByDepartment = [...allProductsByDepartment!];
            allProductsByDepartment?.forEach((productsByDepartments, productsByDepartmentsIndex) => {
                const productIndex = productsByDepartments.products?.findIndex(productItem => productItem.depots![0].id === depot.id)
                if (productIndex! > -1) {
                    newAllProductsByDepartment[productsByDepartmentsIndex].products![productIndex!].storesDistribution = response;

                    //ToDo: break loop
                }
            })
            setAllProductsByDepartment(newAllProductsByDepartment);
        }
    }

    //expand description
    const [expandIndex, setExpandIndex] = useState<number | null>(null);

    const TableContent = ({ formik }: any) => {
        function handleOpenNewUnitsForm(event: React.MouseEvent<HTMLButtonElement, MouseEvent>, product: productsProps) {
            event.stopPropagation();

            if (!selectedProduct || (selectedProduct?.id !== product.id)) {
                setSelectedProduct(product);
            }

            setDisplayNewUnitsForm(true);
        }

        function handleOpenUpdateStoreDepotForm(event: React.MouseEvent<HTMLButtonElement, MouseEvent>, product: productsProps, storeIndex: number, storeName: string) {
            event.stopPropagation();

            if (!selectedProduct || (selectedProduct?.id !== product.id)) {
                setSelectedProduct(product)
            }

            formik.setFieldValue(
                "productStoreDepotDistribution.warehouseQuantity",
                product.depots![0].product_total_remaining_units
            )
            formik.setFieldValue(
                "productStoreDepotDistribution.storeQuantity",
                product.storesDistribution![storeIndex]?.store_depots![0]?.product_remaining_units ?? null
            )

            setStoreDepotUpdateIndex(storeIndex)
            setDisplayUpdateDepotQuantityForm(true)
        }

        function handleExpand(rowIndex: number) {
            if (rowIndex === expandIndex) return setExpandIndex(null);

            return setExpandIndex(rowIndex);
        }

        const filteredProducts = dataProducts?.filter(
            (product: productsProps) =>
                product?.name?.toUpperCase().includes(formik.values.searchBarValue.toUpperCase()) ||
                product?.description?.toUpperCase().includes(formik.values.searchBarValue.toUpperCase()));
        return (
            <TableBody>
                {filteredProducts?.map(
                    (product, index) => (
                        <React.Fragment key={product.id}>
                            <TableRow
                                hover
                                tabIndex={-1}
                                selected={!!selectedProduct && (product.id === selectedProduct.id)}
                                onClick={() => handleExpand(index)}
                                sx={tableStyles.row}
                            >
                                <TableCell padding={"none"}>
                                    <IconButton
                                        size={"small"}
                                        onClick={() => handleExpand(index)}
                                    >
                                        {
                                            expandIndex === index
                                                ? <ExpandLessOutlined />
                                                : <ExpandMoreOutlined />
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
                                                    {product.images!.map(
                                                        imageItem => <Avatar
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

                                    <Box display={"flex"} justifyContent={"center"}>
                                        {product.name}
                                    </Box>
                                </TableCell>
                                <TableCell>
                                    <Box display={"flex"}>
                                        {product.departments?.name ?? "-"}
                                    </Box>
                                </TableCell>
                                <TableCell>
                                    <Grid container>
                                        <Grid item xs={12}>
                                            {product.depots![0].product_total_remaining_units ?? "-"} de {product.depots![0].product_total_units ?? "-"}
                                        </Grid>
                                        <Grid item xs={12} display="flex">
                                            <IconButton
                                                color={"inherit"}
                                                onClick={(event) => handleOpenNewUnitsForm(event, product)}
                                            >
                                                <Add fontSize={"small"} />
                                            </IconButton>
                                        </Grid>
                                    </Grid>
                                </TableCell>
                            </TableRow>

                            <TableRow>
                                <TableCell style={{ padding: 0 }} colSpan={5}>
                                    <Collapse in={expandIndex === index} timeout="auto" unmountOnExit>
                                        <Grid container spacing={1} sx={{ padding: "8px 26px" }}>
                                            <Grid item xs={12}>
                                                <Typography variant="subtitle1" gutterBottom component="div">
                                                    Detalles:
                                                </Typography>
                                            </Grid>

                                            <Grid container item spacing={1} xs={12}>
                                                <Grid item xs={"auto"} sx={{ fontWeight: 600 }}>Producto:</Grid>
                                                <Grid item xs={true}>{product.name}</Grid>
                                            </Grid>
                                            {!!product.description &&
                                                <Grid container item spacing={1} xs={12}>
                                                    <Grid item xs={"auto"} sx={{ fontWeight: 600 }}>Descripción:</Grid>
                                                    <Grid item xs={true}>
                                                        {product.description}
                                                    </Grid>
                                                </Grid>
                                            }

                                            <Grid container item spacing={1} xs={12}>
                                                <Grid item xs={"auto"} sx={{ fontWeight: 600 }}>Departamento:</Grid>
                                                <Grid item xs={true}>{product.departments?.name ?? "-"}</Grid>
                                            </Grid>

                                            <Grid container item spacing={1} xs={12}>
                                                <Grid item xs={"auto"}
                                                    sx={{ fontWeight: 600, display: "flex", alignItems: "center" }}>Características:</Grid>
                                                <Grid item xs={true} sx={{ display: "flex", alignItems: "center" }}>
                                                    {product.characteristics?.length! > 0
                                                        ? product.characteristics?.map(characteristic => (
                                                            <Grid
                                                                key={characteristic.id}
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
                                                                <Grid container item alignItems={"center"}
                                                                    sx={{ marginRight: "3px" }}>
                                                                    <Typography variant={"caption"}
                                                                        sx={{ color: "white", fontWeight: "600" }}>
                                                                        {characteristic.name?.toUpperCase()}
                                                                    </Typography>
                                                                </Grid>
                                                                <Grid container item alignItems={"center"}
                                                                    sx={{ color: "rgba(16,27,44,0.8)" }}>
                                                                    {characteristic.value}
                                                                </Grid>
                                                            </Grid>
                                                        )
                                                        ) : "-"
                                                    }
                                                </Grid>
                                            </Grid>

                                            <Grid container item spacing={1} xs={12}>
                                                <Grid item xs={"auto"} sx={{ fontWeight: 600 }}>Precio de compra:</Grid>
                                                <Grid item xs={true}>{product.buy_price ?? "-"}</Grid>
                                            </Grid>

                                            <Grid container item spacing={1} xs={12}>
                                                <Grid item xs={"auto"} sx={{ fontWeight: 600 }}>Creación:</Grid>
                                                <Grid item xs={true}>
                                                    {`${dayjs(product.depots![0].created_at).format("DD/MM/YYYY HH:MM")}`}
                                                </Grid>
                                            </Grid>

                                            <Grid container item spacing={1} xs={12}>
                                                <Grid item xs={"auto"} sx={{ fontWeight: 600 }}>Unidades restantes de
                                                    total:</Grid>
                                                <Grid item xs={true}>
                                                    {product.depots![0].product_total_remaining_units ?? "-"} de {product.depots![0].product_total_units ?? "-"}
                                                </Grid>
                                            </Grid>

                                            <Grid container item spacing={1} xs={12}>
                                                <Grid item xs={"auto"}>
                                                    {
                                                        product.storesDistribution ? (
                                                            <Box sx={{ display: "inline-flex", fontWeight: 600 }}>Distribución
                                                                del producto</Box>
                                                        ) : (
                                                            <Box
                                                                sx={{ cursor: "pointer", display: "flex", alignItems: "center", color: "blue" }}
                                                                onClick={() => handleLoadStoresDistribution(product.depots![0])}
                                                            >
                                                                Ver distribución del producto
                                                                <ShareOutlined fontSize={"small"} sx={{ ml: "5px" }} />
                                                            </Box>
                                                        )
                                                    }
                                                </Grid>
                                            </Grid>

                                            {
                                                product.storesDistribution && (
                                                    product.storesDistribution.map((store, storeIndex) => (
                                                        <Grid container item spacing={1} xs={12} key={store.id}>
                                                            <Grid item xs={"auto"}
                                                                sx={{ fontWeight: 600, display: "flex", alignItems: "center" }}>
                                                                <ChevronRightOutlined fontSize={"small"} />
                                                                {store.name}:
                                                            </Grid>
                                                            <Grid item xs={true}>
                                                                {
                                                                    store.store_depots?.length! > 0
                                                                        ? `Total ${store.store_depots![0].product_units} | ${store.store_depots![0].product_remaining_units} Restantes`
                                                                        : "no asignado"
                                                                }

                                                                <IconButton
                                                                    size={"small"}
                                                                    sx={{ ml: "10px" }}
                                                                    onClick={
                                                                        (e) => handleOpenUpdateStoreDepotForm(e, product, storeIndex, store.name!)
                                                                    }>
                                                                    <EditOutlined fontSize={"small"} />
                                                                </IconButton>
                                                            </Grid>
                                                        </Grid>
                                                    ))
                                                )
                                            }
                                        </Grid>
                                    </Collapse>
                                </TableCell>
                            </TableRow>
                        </React.Fragment>
                    ))
                }
            </TableBody >
        )
    }

    return (
        <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={() => { }}
        >
            {
                (formik) => (
                    <Card variant={"outlined"}>
                        {
                            isFilterModalOpen && (allProductsByDepartment?.length! > 0) && (
                                <FilterProductsByDepartmentsModal
                                    allProductsByDepartment={allProductsByDepartment!}
                                    setAllProductsByDepartment={setAllProductsByDepartment}
                                    setFiltersApplied={setFiltersApplied}
                                    isFilterModalOpen={isFilterModalOpen}
                                    toggleModalFilter={toggleModalFilter}
                                />
                            )
                        }

                        <ModalAddProduct
                            open={activeModalAddProduct}
                            setOpen={setActiveModalAddProduct}
                            dialogTitle="Nuevo Depósito"
                            handleForceRender={reloadData}
                        >
                            <UserWarehouseForm
                                ownerId={ownerId}
                                warehouseId={warehouseDetails?.id}
                                dataAllProducts={dataProducts!}
                            />
                        </ModalAddProduct>

                        <UpdateValueDialog
                            dialogTitle={"Agregar unidades"}
                            open={displayNewUnitsForm}
                            setOpen={setDisplayNewUnitsForm}
                            formik={formik}
                        >
                            <NewUnitsQuantityForm formik={formik} />
                        </UpdateValueDialog>

                        <UpdateValueDialog
                            dialogTitle={"Redistribuir productos"}
                            open={displayUpdateDepotQuantityForm}
                            setOpen={setDisplayUpdateDepotQuantityForm}
                            formik={formik}
                        >
                            <UpdateStoreDepotQuantityForm formik={formik} />
                        </UpdateValueDialog>

                        <ImagesDisplayDialog
                            open={openImagesDialog}
                            setOpen={setOpenImagesDialog}
                            images={dialogImages}
                        />

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
                                                    placeholder="Buscar depósito..."
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
                                                <TableNoData hasData={dataProducts?.length!} />
                                            )
                                    }
                                </Grid>
                            </Card>
                        </CardContent>
                    </Card>
                )
            }
        </Formik>
    )
}

export default UserWarehouseMainTable