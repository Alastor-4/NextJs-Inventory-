"use client"

import {
    AppBar, Avatar, AvatarGroup, Box, Button, Card, CardContent,
    Checkbox, Divider, Grid, IconButton, InputBase, Table, TableBody,
    TableCell, TableContainer, TableHead, TableRow, Toolbar, Typography,
} from "@mui/material";
import {
    AddOutlined,
    ArrowLeft,
    DeleteOutline,
    EditOutlined,
    FilterAlt,
    HelpOutline,
    InfoOutlined
} from "@mui/icons-material";
import { ProductsMainTableProps, allProductsByDepartmentProps, productsProps } from "@/types/interfaces";
import FilterProductsByDepartmentsModal from "@/components/modals/FilterProductsByDepartmentsModal";
import { notifyError, notifySuccess } from "@/utils/generalFunctions";
import { images, characteristics, departments } from '@prisma/client';
import ImagesDisplayDialog from "@/components/ImagesDisplayDialog";
import ConfirmDeleteDialog from "@/components/ConfirmDeleteDialog";
import { TableNoData } from "@/components/TableNoData";
import ModalUpdateProduct from "./ModalUpdateProduct";
import { grey, orange } from '@mui/material/colors';
import SearchIcon from '@mui/icons-material/Search';
import React, { useEffect, useState } from "react";
import InfoTooltip from "@/components/InfoTooltip";
import products from "../requests/products";
import { useRouter } from "next/navigation";
import ProductsForm from "./ProductsForm";
import { Formik } from "formik";
import {CustomTooltip} from "@/components/InfoTags";

export const ProductsMainTable = ({ userId, ownerId }: ProductsMainTableProps) => {
    const router = useRouter();

    //Products data
    const [allProductsByDepartment, setAllProductsByDepartment] = useState<allProductsByDepartmentProps[] | null>(null);
    const [selectedProduct, setSelectedProduct] = useState<productsProps | null>(null);
    const [dataProducts, setDataProducts] = useState<productsProps[] | null>(null);
    const [filtersApplied, setFiltersApplied] = useState<boolean>(false);

    //GET initial data
    useEffect(() => {
        const getAllProductsByDepartment = async () => {
            const newAllProductsByDepartment: allProductsByDepartmentProps[] | null = await products.allOwnerProductDepartments(ownerId!);

            if (newAllProductsByDepartment) {
                setAllProductsByDepartment(newAllProductsByDepartment.map((productsByDepartments: allProductsByDepartmentProps) => ({
                    ...productsByDepartments,
                    selected: false
                })))

                setSelectedProduct(null);
            }
        }
        getAllProductsByDepartment();
    }, [userId, ownerId]);

    const reloadData = async () => {
        let newAllProductsByDepartment: allProductsByDepartmentProps[] | null = await products.allOwnerProductDepartments(ownerId!);
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

    //GET all departments
    const [departments, setDepartments] = useState<departments[] | null>(null);
    useEffect(() => {
        const getAllDepartments = async () => {
            const departments = await products.getDepartmentsByOnwerAndGlobal(ownerId!)
            setDepartments(departments)
        }

        if (!departments) getAllDepartments();
    }, [departments, userId, ownerId]);

    //Modals handlers
    const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
    const [isUpdateModalOpen, setIsUpdateModalOpen] = useState<boolean>(false);
    const [isFilterModalOpen, setIsFilterModalOpen] = useState<boolean>(false);

    const toggleModalCreate = () => setIsCreateModalOpen(!isCreateModalOpen);
    const toggleModalUpdate = () => setIsUpdateModalOpen(!isUpdateModalOpen);
    const toggleModalFilter = () => {
        if (!dataProducts) return;
        setIsFilterModalOpen(!isFilterModalOpen);
    }

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

    //Handle selected product
    const handleSelectProduct = (product: productsProps) => {
        if (selectedProduct && (selectedProduct.id === product.id)) {
            setSelectedProduct(null);
        } else {
            setSelectedProduct(product);
        }
    }

    const [isOpenTooltip, setIsOpenTooltip] = useState<boolean>(false);
    const handleTooltipClose = () => setIsOpenTooltip(false);
    const handleTooltipOpen = () => setIsOpenTooltip(true);

    //Handle delete product
    const [openConfirmDialog, setOpenConfirmDialog] = React.useState(false)

    const handleCloseConfirmDialog = () => setOpenConfirmDialog(false)
    const handleOpenConfirmDialog = () => setOpenConfirmDialog(true)

    const handleRemove = async () => {
        const response = await products.delete(selectedProduct?.id!);
        if (response) {
            setSelectedProduct(null);

            let updatedProducts = await products.allOwnerProductDepartments(ownerId!);

            if (updatedProducts) {
                updatedProducts = updatedProducts.map((productsByDepartments: allProductsByDepartmentProps) => {
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

                setAllProductsByDepartment(updatedProducts);

                notifySuccess("Se ha eliminado el producto");
            }
        } else notifyError("Error al eliminar el producto. Solo es posibe eliminar productos que no están siendo usados en el sistema", true);
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

                                <IconButton color={"inherit"} onClick={handleOpenConfirmDialog}>
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
            { id: "name", label: "Nombre", },
            { id: "description", label: "Descripción", },
            { id: "department", label: "Departamento", },
            { id: "characteristics", label: "Características", },
            { id: "created_by", label: "Creador", },
        ]

        return (
            <TableHead>
                <TableRow>
                    <TableCell
                        key={"checkbox"}
                        padding={'checkbox'}
                    />
                    {headCells.map(headCell => (
                        <TableCell
                            key={headCell.id}
                            align={"center"}
                            padding={'normal'}
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
                            sx={
                                product.is_approved
                                    ? {}
                                    : {fontStyle: "italic"}
                            }
                        >
                            <TableCell>
                                <Checkbox
                                    size={"small"}
                                    checked={!!selectedProduct && (product.id === selectedProduct.id)}
                                    onClick={() => handleSelectProduct(product)}
                                    sx={{ width: "5px" }}
                                />

                                {
                                    !product.is_approved && (
                                        <CustomTooltip tooltipText={"Producto pendiente a aprobación por el dueño"}>
                                            <InfoOutlined fontSize={"small"} color={"warning"}/>
                                        </CustomTooltip>
                                    )
                                }
                            </TableCell>
                            <TableCell align="center">
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
                            <TableCell align="center">
                                {product.description ?? "-"}
                            </TableCell>
                            <TableCell align="center">
                                {product?.departments?.name ?? "-"}
                            </TableCell>
                            <TableCell align="center">
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
                            <TableCell align="center">
                                {product.created_by_user.name}
                            </TableCell>
                        </TableRow>
                    ))}
            </TableBody>
        )
    }

    return (
        <>
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
                    ownerId={ownerId}
                    departments={departments}
                    productId={null}
                    setOpen={setIsCreateModalOpen}
                    handleForceRender={reloadData}
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
                    productId={selectedProduct?.id!}
                    setOpen={setIsUpdateModalOpen}
                    handleForceRender={reloadData}
                />
            </ModalUpdateProduct>

            <ConfirmDeleteDialog
                open={openConfirmDialog}
                handleClose={handleCloseConfirmDialog}
                title={"Confirmar acción"}
                message={"Tenga en cuenta que solo es posible eliminar productos que no están siendo usados en el sistema. Confirma eliminar el producto?"}
                confirmAction={handleRemove}
            />

            <Formik
                initialValues={{ searchBarValue: "" }}
                onSubmit={() => { }}
            >
                {
                    (formik) => (
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
                                                    <TableNoData hasData={dataProducts?.length!} />
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