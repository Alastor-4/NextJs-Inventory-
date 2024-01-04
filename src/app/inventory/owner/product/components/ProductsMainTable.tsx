"use client"

import React, { useEffect, useState } from "react";
import {
    AppBar, Avatar, AvatarGroup, Box, Button,
    Card, CardContent, Checkbox, ClickAwayListener,
    Divider, Grid, IconButton, InputBase, Table, TableBody,
    TableCell, TableContainer, TableHead, TableRow, Toolbar, Tooltip, Typography,
} from "@mui/material";
import SearchIcon from '@mui/icons-material/Search';
import { TableNoData } from "@/components/TableNoData";
import { AddOutlined, ArrowLeft, DeleteOutline, EditOutlined, FilterAlt, HelpOutline } from "@mui/icons-material";
import { ProductsMainTableProps, allProductsByDepartmentProps, productsProps } from "@/types/interfaces";
import FilterProductsByDepartmentsModal from "@/components/nodals/FilterProductsByDepartmentsModal";
import { notifyError, notifySuccess } from "@/utils/generalFunctions";
import { images, characteristics, departments } from '@prisma/client';
import ImagesDisplayDialog from "@/components/ImagesDisplayDialog";
import { useStoreHook } from "@/app/store/useStoreHook";
import ModalUpdateProduct from "./ModalUpdateProduct";
import { useStore } from "@/app/store/store";
import products from "../requests/products";
import { useRouter } from "next/navigation";
import ProductsForm from "./ProductsForm";
import { Formik } from "formik";

export const ProductsMainTable = ({ userId }: ProductsMainTableProps) => {
    const router = useRouter();

    const store = useStoreHook(useStore, (state) => state.ownerProductsCount);

    //Products data
    const [dataProducts, setDataProducts] = useState<productsProps[] | null>(null);
    const [allProductsByDepartment, setAllProductsByDepartment] = useState<allProductsByDepartmentProps[] | null>(null);
    const [selectedProduct, setSelectedProduct] = useState<productsProps | null>(null);

    const [selectedDepartments, setSelectedDepartments] = useState<allProductsByDepartmentProps[] | null>(null);

    const [forceRender, setForceRender] = useState<boolean>(false);

    //GET initial data
    useEffect(() => {
        const getAllProductsByDepartment = async () => {
            const newAllProductsByDepartment = await products.allUserProductDepartments(userId);
            setAllProductsByDepartment(newAllProductsByDepartment.map((department: allProductsByDepartmentProps) => ({
                ...department,
                selected: false
            })))
            setForceRender(false);
            setSelectedProduct(null);
        }
        getAllProductsByDepartment();
    }, [userId, forceRender]);

    //GET all departments
    const [departments, setDepartments] = useState<departments[] | null>(null);
    useEffect(() => {
        const getAllDepartments = async () => {
            const departments = await products.getDepartments()
            setDepartments(departments);
        }
        if (departments === null) getAllDepartments();
    }, [departments]);

    //Modals handlers
    const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
    const [isUpdateModalOpen, setIsUpdateModalOpen] = useState<boolean>(false);
    const [isFilterModalOpen, setIsFilterModalOpen] = useState<boolean>(false);

    const toggleModalCreate = () => setIsCreateModalOpen(!isCreateModalOpen);
    const toggleModalUpdate = () => setIsUpdateModalOpen(!isUpdateModalOpen);
    const toggleModalFilter = () => setIsFilterModalOpen(!isFilterModalOpen);

    //Update allProducts at change
    useEffect(() => {
        if (allProductsByDepartment?.length) {

            let allProducts: productsProps[] = [];
            let bool = false;
            if (selectedDepartments) {
                for (const department of selectedDepartments!) if (department.selected === true) bool = true;
            }
            allProductsByDepartment?.forEach((departmentItem) => {
                if (!selectedDepartments || selectedDepartments?.length! === 0 || !bool) {
                    allProducts = [...allProducts, ...departmentItem.products!];
                }
                if (selectedDepartments?.length! > 0 && bool) {
                    if (departmentItem.selected) {
                        allProducts = [...allProducts, ...departmentItem.products!];
                    }
                }
            })

            allProducts.sort((a: productsProps, b: productsProps) => {
                if (a?.name! < b?.name!) return -1;
                if (a?.name! > a?.name!) return 1;
                return 0;
            });
            setDataProducts(allProducts);
        }
    }, [allProductsByDepartment, selectedDepartments, isFilterModalOpen]);

    //Handle selected product
    const handleSelectProduct = (product: productsProps) => {
        if (selectedProduct && (selectedProduct.id === product.id)) {
            setSelectedProduct(null);
        } else {
            setSelectedProduct(product);
        }
    }

    const [isOpenTooltip, setIsOpenTooltip] = useState<boolean>(false);
    const handleTooltipClose = () => {
        setIsOpenTooltip(false);
    }
    const handleTooltipOpen = () => {
        setIsOpenTooltip(true);
    }

    //Handle delete product
    const handleRemove = async () => {
        const response = await products.delete(userId, selectedProduct?.id!)
        if (response) {
            setSelectedProduct(null);
            const selectedFilters = allProductsByDepartment?.filter(department => department.selected).map(department => department.id);
            const updatedProducts = await products.allUserProductDepartments(userId)
            if (updatedProducts) {
                setAllProductsByDepartment(updatedProducts.map((department: allProductsByDepartmentProps) => ({ ...department, selected: selectedFilters?.includes(department.id) })))
                notifySuccess("Se ha eliminado el producto");
            } else notifyError("Error al eliminar el producto");
        }
    }

    const handleNavigateBack = () => { router.push(`/inventory`); }

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
                        Productos
                    </Typography>
                </Box>

                <Box sx={{ display: "flex" }}>
                    {
                        selectedProduct && (
                            <Box sx={{ display: "flex" }}>
                                <IconButton color={"inherit"} onClick={toggleModalUpdate}>
                                    <EditOutlined fontSize={"small"} />
                                </IconButton>

                                <IconButton color={"inherit"} onClick={handleRemove}>
                                    <DeleteOutline fontSize={"small"} />
                                </IconButton>

                                <Divider orientation="vertical" variant="middle" flexItem
                                    sx={{ borderRight: "2px solid white", mx: "5px" }} />
                            </Box>
                        )
                    }
                    <IconButton sx={{ color: "white" }} onClick={toggleModalCreate}>
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
                align: "left"
            },
            {
                id: "description",
                label: "Descripción",
                align: "left"
            },
            {
                id: "department",
                label: "Departamento",
                align: "left"
            },
            {
                id: "characteristics",
                label: "Características",
                align: "left"
            },
        ]

        return (
            <TableHead>
                <TableRow>
                    <TableCell
                        key={"checkbox"}
                        align={"left"}
                        padding={'checkbox'}
                        sx={{ width: "5px" }}
                    >

                    </TableCell>
                    {headCells.map(headCell => (
                        <TableCell
                            key={headCell.id}
                            align={"left"}
                            padding={'normal'}
                            sx={{ width: "auto" }}
                        >
                            {headCell.label}
                        </TableCell>
                    ))}
                </TableRow>
            </TableHead>
        )
    }

    const TableContent = ({ formik }: any) => {
        const filteredProducts = dataProducts?.filter(
            (product: productsProps) =>
                product?.name?.toUpperCase().includes(formik.values.searchBarValue.toUpperCase()) ||
                product?.description?.toUpperCase().includes(formik.values.searchBarValue.toUpperCase()));
        return (
            <TableBody >
                {filteredProducts?.map(
                    (product: productsProps) => (
                        <TableRow
                            key={product.id}
                            hover
                            tabIndex={-1}
                            selected={!!selectedProduct && (product.id === selectedProduct.id)}
                        >
                            <TableCell>
                                <Checkbox
                                    size={"small"}
                                    checked={!!selectedProduct && (product.id === selectedProduct.id)}
                                    onClick={() => handleSelectProduct(product)}
                                    sx={{ width: "5px" }}

                                />
                            </TableCell>
                            <TableCell>
                                <Grid container >
                                    {
                                        product?.images?.length! > 0 && (
                                            <Grid container item xs={12} justifyContent={"center"}>
                                                <AvatarGroup
                                                    max={3}
                                                    sx={{ flexDirection: "row", width: "fit-content" }}
                                                    onClick={() => handleOpenImagesDialog(product?.images!)}
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
                                            </Grid>
                                        )
                                    }

                                    <Grid container item xs={12} justifyContent={"center"}>
                                        {product.name}
                                    </Grid>
                                </Grid>
                            </TableCell>
                            <TableCell>
                                {product.description ?? "-"}
                            </TableCell>
                            <TableCell>
                                {product?.departments?.name ?? "-"}
                            </TableCell>
                            <TableCell>
                                {product.characteristics?.length! > 0
                                    ? product.characteristics?.map((characteristics: characteristics) => (
                                        <Grid
                                            key={characteristics.id}
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
                                                    {characteristics.name?.toUpperCase()}
                                                </Typography>
                                            </Grid>
                                            <Grid container item alignItems={"center"}
                                                sx={{ color: "rgba(16,27,44,0.8)" }}>
                                                {characteristics.value}
                                            </Grid>
                                        </Grid>
                                    )
                                    ) : "-"
                                }
                            </TableCell>
                        </TableRow>
                    ))}
            </TableBody>
        )
    }

    return (
        <>
            <FilterProductsByDepartmentsModal
                allProductsByDepartment={allProductsByDepartment!}
                setSelectedDepartments={setSelectedDepartments}
                isFilterModalOpen={isFilterModalOpen}
                toggleModalFilter={toggleModalFilter}
            />

            <ImagesDisplayDialog
                open={openImageDialog}
                setOpen={setOpenImagesDialog}
                images={dialogImages}
            />

            <ModalUpdateProduct
                open={isCreateModalOpen}
                setOpen={setIsCreateModalOpen}
                dialogTitle="Crear Producto"
            >
                <ProductsForm
                    userId={userId}
                    departments={departments}
                    productId={null}
                    setForceRender={setForceRender}
                    setOpen={setIsCreateModalOpen}
                />
            </ModalUpdateProduct>

            <ModalUpdateProduct
                open={isUpdateModalOpen}
                setOpen={setIsUpdateModalOpen}
                dialogTitle="Modificar Producto"
            >
                <ProductsForm
                    userId={userId}
                    departments={departments}
                    productId={selectedProduct?.id}
                    setForceRender={setForceRender}
                    setOpen={setIsUpdateModalOpen}
                />
            </ModalUpdateProduct>

            <Formik
                initialValues={{ searchBarValue: "" }}
                onSubmit={() => { }}
            >
                {
                    (formik) => (
                        <Card variant={"outlined"}>
                            <CustomToolbar />
                            <CardContent>
                                <Card variant={"outlined"} sx={{ padding: "15px", marginBottom: "10px" }}>
                                    <Grid item container alignContent="center" alignItems="center" justifyContent="center">
                                        <Grid item>
                                            <Typography variant="subtitle1" sx={{ fontWeight: "400", marginBottom: "5px" }}>Búsqueda avanzada</Typography>
                                        </Grid>
                                        <Grid item>
                                            <ClickAwayListener onClickAway={handleTooltipClose}>
                                                <Tooltip
                                                    PopperProps={{ disablePortal: true, }}
                                                    onClose={handleTooltipClose}
                                                    open={isOpenTooltip}
                                                    disableFocusListener
                                                    disableHoverListener
                                                    placement="bottom-start"
                                                    disableTouchListener
                                                    title={<Typography variant="subtitle2">
                                                        Puede buscar por nombre y descripción
                                                        <br /> ó filtrar por departamentos
                                                    </Typography>}
                                                >
                                                    <IconButton onClick={handleTooltipOpen}>
                                                        <HelpOutline />
                                                    </IconButton>
                                                </Tooltip>
                                            </ClickAwayListener>
                                        </Grid>
                                    </Grid>
                                    <Grid container direction="row" rowSpacing={2} alignItems="center" justifyContent="center">
                                        <Grid item xs={8} >
                                            <Card variant="outlined">
                                                <Grid item container borderRadius={"5px"} margin="4px" width="100%" position="relative" >
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
                                            </Card>
                                        </Grid>
                                        <Grid item xs={4} paddingX="10px">
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
                                                    <TableNoData hasData={store} />
                                                )
                                        }
                                    </Grid>
                                </Card>
                            </CardContent>
                        </Card >
                    )
                }
            </Formik >
        </>
    )
}

export default ProductsMainTable;