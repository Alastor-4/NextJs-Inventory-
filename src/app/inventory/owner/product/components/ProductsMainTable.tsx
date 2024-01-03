"use client"

import React, { useEffect, useState } from "react";
import {
    AppBar, Avatar, AvatarGroup,
    Box, Button, Card, CardContent,
    Checkbox, Chip, Dialog, DialogActions,
    DialogContent, DialogTitle, Divider, Grid,
    IconButton, InputBase, Stack, Table,
    TableBody, TableCell, TableContainer,
    TableHead, TableRow, Toolbar, Typography,
} from "@mui/material";
import SearchIcon from '@mui/icons-material/Search';
import { TableNoData } from "@/components/TableNoData";
import {
    AddOutlined, ArrowLeft, CheckBoxOutlineBlank, CheckBoxOutlined,
    DeleteOutline, EditOutlined, FilterAlt, FilterAltOff
} from "@mui/icons-material";
import { ProductsMainTableProps, allProductsByDepartmentProps, productsProps } from "@/types/interfaces";
import { notifyError, notifySuccess } from "@/utils/generalFunctions";
import ImagesDisplayDialog from "@/components/ImagesDisplayDialog";
import { images, characteristics, departments } from '@prisma/client';
import ModalUpdateProduct from "./ModalUpdateProduct";
import { useStore } from "@/app/store/store";
import products from "../requests/products";
import { useRouter } from "next/navigation";
import ProductsForm from "./ProductsForm";
import { Formik } from "formik";

export const ProductsMainTable = ({ userId }: ProductsMainTableProps) => {
    const router = useRouter();
    const productsCount = useStore((state) => state.ownerProductsCount);

    //Products data
    const [dataProducts, setDataProducts] = useState<productsProps[] | null>(null);
    const [allProductsByDepartment, setAllProductsByDepartment] = useState<allProductsByDepartmentProps[] | null>(null);
    const [selectedProduct, setSelectedProduct] = useState<productsProps | null>(null);

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
    const [departments, setDepartments] = React.useState<departments[] | null>(null);
    useEffect(() => {
        const getAllDepartments = async () => {
            const departments = await products.getDepartments()
            setDepartments(departments);
        }
        if (departments === null) getAllDepartments();
    }, [departments]);

    //Update allProducts at change
    useEffect(() => {
        if (allProductsByDepartment?.length) {
            let allProducts: productsProps[] = [];

            allProductsByDepartment?.forEach((departmentItem) => {
                // if (departmentItem.selected) {//TODO
                allProducts = [...allProducts, ...departmentItem.products!]
                // }
            })

            allProducts.sort((a: productsProps, b: productsProps) => {
                if (a?.name! < b?.name!) return -1;
                if (a?.name! > a?.name!) return 1;
                return 0;
            });
            setDataProducts(allProducts);
        }
    }, [allProductsByDepartment]);

    //Modals handlers
    const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
    const [isUpdateModalOpen, setIsUpdateModalOpen] = useState<boolean>(false);
    const [isFilterModalOpen, setIsFilterModalOpen] = useState<boolean>(false);

    const toggleModalCreate = () => setIsCreateModalOpen(!isCreateModalOpen);
    const toggleModalUpdate = () => setIsUpdateModalOpen(!isUpdateModalOpen);
    const toggleModalFilter = () => setIsFilterModalOpen(!isFilterModalOpen);

    //Handle selected product
    const handleSelectProduct = (product: productsProps) => {
        if (selectedProduct && (selectedProduct.id === product.id)) {
            setSelectedProduct(null);
        } else {
            setSelectedProduct(product);
        }
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


    // interface FilterDepartmentsModalProps {
    //     allProductsByDepartment: allProductsByDepartmentProps[] | null;
    // }

    //{ allProductsByDepartment }: FilterDepartmentsModalProps
    const FilterDepartmentsModal = () => {
        const [filterDepartments, setFilterDepartments] = useState<allProductsByDepartmentProps[] | null>();

        useEffect(() => {
            const handleFilters = () => {
                // setFilterDepartments()
            }
            handleFilters();
        }, [filterDepartments]);

        const handleRemoveFilter = () => {
            handleDepartmentClick(0, true);
            setFilterDepartments(null);
        }

        const handleDepartmentClick = (index: number, remove?: boolean) => {
            let filters = [...allProductsByDepartment!]
            if (remove) {
                filters.forEach((department: allProductsByDepartmentProps) => { department.selected = false });
            }
            else {
                filters.forEach((department: allProductsByDepartmentProps) => { if (department.id === index) { department.selected = !department.selected } });
            }
            setFilterDepartments(filters);
        }

        return (
            <Dialog open={isFilterModalOpen} fullWidth onClose={toggleModalFilter}>
                <DialogTitle m="auto">Filtrar por departamentos</DialogTitle>
                <DialogContent dividers sx={{ marginX: "20px" }}>
                    <Stack spacing={{ xs: 1, sm: 2 }} direction="row" useFlexGap flexWrap="wrap" >
                        {allProductsByDepartment?.map((department: any) => (
                            <Chip
                                key={department.id!}
                                label={department.name}
                                clickable={true}
                                size="medium"
                                onClick={() => handleDepartmentClick(department.id)}
                                variant={department.selected ? "filled" : "outlined"}
                                sx={{ display: "flex" }}
                                icon={department.selected ? <CheckBoxOutlined /> : <CheckBoxOutlineBlank />}
                                color="primary"
                            />
                        ))}
                    </Stack>
                </DialogContent>
                <DialogActions sx={{ marginRight: "15px" }}>
                    <Button startIcon={<FilterAltOff />} color="error" variant="outlined" onClick={handleRemoveFilter}>Limpiar</Button>
                </DialogActions>
            </Dialog>
        );
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
        return (
            <TableBody>
                {dataProducts?.filter(
                    (product: productsProps) =>
                        product?.name?.toUpperCase().includes(formik.values.searchBarValue.toUpperCase()) ||
                        product?.description?.toUpperCase().includes(formik.values.searchBarValue.toUpperCase())).map(
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
            <FilterDepartmentsModal
            //  allProductsByDepartment={allProductsByDepartment!}
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
                                    <Grid item alignContent="center">
                                        <Typography variant="subtitle1" sx={{ fontWeight: "400", marginBottom: "5px" }}>Poner algo con Tooltip</Typography>
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
                                                ? (
                                                    <TableContainer sx={{ width: "100%", overflowX: "auto" }}>
                                                        <Table sx={{ width: "100%" }} size={"small"}>
                                                            <TableHeader />

                                                            <TableContent formik={formik} />
                                                        </Table>
                                                    </TableContainer>
                                                ) : (
                                                    <TableNoData hasData={productsCount} />
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