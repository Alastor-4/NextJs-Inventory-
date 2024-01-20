"use client"

import { Avatar, AvatarGroup, Box, Button, Card, CardContent, Checkbox, Grid, IconButton, InputBase, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Typography } from "@mui/material";
import { UserWarehouseFormProps, allProductsByDepartmentProps, productsProps } from "@/types/interfaces";
import FilterProductsByDepartmentsModal from "@/components/modals/FilterProductsByDepartmentsModal";
import { notifyError, notifySuccess } from "@/utils/generalFunctions";
import ImagesDisplayDialog from "@/components/ImagesDisplayDialog";
import { FilterAlt, HelpOutline } from "@mui/icons-material";
import warehouseDepots from "../requests/warehouseDepots";
import { characteristics, images } from "@prisma/client";
import { TableNoData } from "@/components/TableNoData";
import { handleKeyDown } from "@/utils/handleKeyDown";
import SearchIcon from '@mui/icons-material/Search';
import React, { useEffect, useState } from "react";
import InfoTooltip from "@/components/InfoTooltip";
import { AxiosResponse } from "axios";
import { useFormik } from "formik";
import * as Yup from "yup"

export const UserWarehouseForm = ({ ownerId, warehouseId }: UserWarehouseFormProps) => {

    const [dataProducts, setDataProducts] = useState<productsProps[] | null>(null);
    const [allProductsByDepartment, setAllProductsByDepartment] = useState<allProductsByDepartmentProps[] | null>(null);
    const [filtersApplied, setFiltersApplied] = useState<boolean>(false);
    const [selectedProduct, setSelectedProduct] = useState<productsProps | null>(null);

    //Handle selected product
    const handleSelectProduct = (product: productsProps) => {
        if (selectedProduct && (selectedProduct.id === product.id)) {
            formik.setFieldValue("product", null);
            setSelectedProduct(null);
        } else {
            formik.setFieldValue("product", product);
            setSelectedProduct(product);
        }
    }

    const [isFilterModalOpen, setIsFilterModalOpen] = useState<boolean>(false);
    const toggleModalFilter = () => setIsFilterModalOpen(!isFilterModalOpen);

    const [isOpenTooltip, setIsOpenTooltip] = useState<boolean>(false);
    const handleTooltipClose = () => setIsOpenTooltip(false);
    const handleTooltipOpen = () => setIsOpenTooltip(true);

    //GET initial products data
    useEffect(() => {
        async function fetchData() {
            const allProductsByDepartmentWithoutDepots: allProductsByDepartmentProps[] | null = await warehouseDepots.allProductsWithoutDepots(ownerId!, warehouseId!)

            setAllProductsByDepartment([...allProductsByDepartmentWithoutDepots!]);
        }
        fetchData();
    }, [ownerId, warehouseId]);

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

    const initialValues = {
        product: null,
        productTotalUnits: "",
        searchBarValue: '',
    }

    const validationSchema = Yup.object({
        product: Yup.object().required("Seleccione un producto"),
        productTotalUnits: Yup.number().integer().required("Especifique cantidad"),
    })

    const [openImageDialog, setOpenImagesDialog] = useState<boolean>(false);
    const [dialogImages, setDialogImages] = useState<images[] | null>(null);

    function handleOpenImagesDialog(images: images[]) {
        setDialogImages(images);
        setOpenImagesDialog(true);
    }

    const handleSubmit = async (values: any) => {
        let response: boolean | AxiosResponse = await warehouseDepots.createDepot(
            {
                warehouseId: warehouseId,
                userId: ownerId,
                productId: values.product.id,
                productTotalUnits: values.productTotalUnits,
                insertedById: ownerId,
            }
        )
        if (!response) return;

        if (response?.status === 200) {
            let allProductsByDepartmentWithoutDepots: allProductsByDepartmentProps[] | null = await warehouseDepots.allProductsWithoutDepots(ownerId!, warehouseId!)

            if (allProductsByDepartmentWithoutDepots) {
                allProductsByDepartmentWithoutDepots = allProductsByDepartmentWithoutDepots.map((productsByDepartments: allProductsByDepartmentProps) => {
                    //search if current department was selected in previous data to keep selection

                    let oldDepartmentSelected = false

                    const oldDepartmentIndex = allProductsByDepartment?.findIndex((productsByDepartmentItem: allProductsByDepartmentProps) => productsByDepartmentItem.id === productsByDepartments.id )
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
                setAllProductsByDepartment(allProductsByDepartmentWithoutDepots);

                formik.resetForm();

                notifySuccess("Se ha creado un nuevo depósito")
            } else {
                notifyError("Error al cargar los datos")
            }

        } else {
            //ToDo: catch validation errors
        }
    }

    const TableHeader = () => {
        const headCells = [
            {
                id: "name",
                label: "Nombre",
            },
            {
                id: "description",
                label: "Descripción",
            },
            {
                id: "department",
                label: "Departamento",
            },
            {
                id: "characteristics",
                label: "Características",
            },
        ]

        return (
            <TableHead>
                <TableRow>
                    <TableCell
                        key={"checkbox"}
                        padding={'checkbox'}
                        sx={{ width: "5px" }}
                    >
                    </TableCell>
                    {headCells.map(headCell => (
                        <TableCell
                            key={headCell.id}
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
    const formik = useFormik({
        initialValues: initialValues,
        validationSchema: validationSchema,
        onSubmit: handleSubmit,
    })

    return (
        <>
            <ImagesDisplayDialog
                open={openImageDialog}
                setOpen={setOpenImagesDialog}
                images={dialogImages}
            />

            {
                isFilterModalOpen && allProductsByDepartment?.length && (
                    <FilterProductsByDepartmentsModal
                        allProductsByDepartment={allProductsByDepartment}
                        setAllProductsByDepartment={setAllProductsByDepartment}
                        setFiltersApplied={setFiltersApplied}
                        isFilterModalOpen={isFilterModalOpen}
                        toggleModalFilter={toggleModalFilter}
                    />
                )
            }

            <form onSubmit={formik.handleSubmit} >
                <CardContent sx={{ width: "100%", marginLeft: "-15px", marginTop: "-15px" }}>
                    <Card variant={"outlined"} sx={{ padding: "10px", marginBottom: "10px" }}>
                        <Grid item container alignItems="center" justifyContent="center" sx={{ marginTop: "-10px" }}>
                            <Grid container item xs={"auto"} alignItems={"center"}>
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
                    <Card variant={"outlined"} sx={{ padding: "10px", marginBottom: "10px" }}>
                        <Grid container item justifyContent="center" justifyItems="center" alignItems="start">
                            <Grid item xs={7} >
                                <TextField
                                    label="Cantidad de unidades"
                                    size={"small"}
                                    onKeyDown={handleKeyDown}
                                    {...formik.getFieldProps("productTotalUnits")}
                                    error={!!formik.errors.productTotalUnits && formik.touched.productTotalUnits}
                                    helperText={(formik.errors.productTotalUnits && formik.touched.productTotalUnits) && formik.errors.productTotalUnits}
                                />
                            </Grid>
                            <Grid item xs={4} marginTop="5px" marginX={1}>
                                <Button
                                    fullWidth
                                    type={"submit"}
                                    color={"primary"}
                                    variant={"contained"}
                                    size={"small"}
                                    disabled={!formik.getFieldProps('product').value || !formik.getFieldProps('productTotalUnits').value || !formik.isValid}
                                >
                                    Crear
                                </Button>
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
            </form>
        </>
    )
}

export default UserWarehouseForm