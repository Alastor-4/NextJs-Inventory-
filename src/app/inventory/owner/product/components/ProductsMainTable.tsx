//@ts-nocheck
"use client"

import React, {useEffect, useState} from "react";
import {
    AppBar, Avatar, AvatarGroup,
    Box,
    Card,
    CardContent,
    Checkbox,
    Divider, Grid,
    IconButton,
    Table,
    TableBody,
    TableCell, TableContainer,
    TableHead,
    TableRow,
    TextField,
    Toolbar,
    Typography
} from "@mui/material";
import { TableNoData } from "@/components/TableNoData";
import {
    AddOutlined,
    ArrowLeft,
    DeleteOutline,
    EditOutlined,
    ExpandLessOutlined,
    ExpandMoreOutlined
} from "@mui/icons-material";
import { useRouter } from "next/navigation";
import products from "../requests/products";
import { Formik } from "formik";
import DepartmentCustomButton from "@/components/DepartmentCustomButton";
import ModalUpdateProduct from "./ModalUpdateProduct";
import ProductsForm from "./ProductsForm";
import { notifyError, notifySuccess } from "@/utils/generalFunctions";
import ImagesDisplayDialog from "@/components/ImagesDisplayDialog";

export default function ProductsMainTable({ userId }: { userId: number }) {
    const router = useRouter()

    const [data, setData] = React.useState(null)
    const [allProductsByDepartment, setAllProductsByDepartment] = React.useState([])

    const [forceRender, setForceRender] = React.useState(false)
    const [activateModalCreateProduct, setActivateModalCreateProduct] = React.useState(false)
    const [activateModalUpdateProduct, setActivateModalUpdateProduct] = React.useState(false)

    const [selected, setSelected] = React.useState(null)

    //get initial data
    React.useEffect(() => {
        const getAllProductsByDepartment = async () => {
            const newAllProductsByDepartment = await products.allUserProductDepartments(userId);
            setAllProductsByDepartment(newAllProductsByDepartment.map((item: any) => ({
                ...item,
                selected: false
            })))
            setForceRender(false)
            setSelected(null)
        }
        getAllProductsByDepartment()

    }, [userId, forceRender])

    React.useEffect(() => {
        if (allProductsByDepartment.length) {
            let allProducts = []

            allProductsByDepartment.forEach((departmentItem) => {
                if (departmentItem.selected) {
                    allProducts = [...allProducts, ...departmentItem.products]
                }
            })

            allProducts.sort((a, b) => {
                if (a.name < b.name)
                    return -1

                if (a.name > a.name)
                    return 1

                return 0
            })

            setData(allProducts)
        }

    }, [allProductsByDepartment])

    //get All Departments
    const [departments, setDepartments] = React.useState(null)
    useEffect(() => {

        const getAllDepartments = async () => {
            const result = await products.getDepartments()
            setDepartments(result)
        }

        if (departments === null) {
            getAllDepartments()
        }
    }, [departments])

    //table selected item
    const handleSelectItem = (item) => {
        if (selected && (selected.id === item.id)) {
            setSelected(null)
        } else {
            setSelected(item)
        }
    }

    async function handleRemove() {
        const response = await products.delete(userId, selected.id)
        if (response) {
            setSelected(null)

            const selectedFilters = allProductsByDepartment.filter(item => item.selected).map(item => item.id)

            const updatedProducts = await products.allUserProductDepartments(userId)

            if (updatedProducts) {
                setAllProductsByDepartment(updatedProducts.map(item => ({ ...item, selected: selectedFilters.includes(item.id) })))
                notifySuccess("Se ha eliminado el producto")
            } else notifyError("Error al eliminar el producto")
        }
    }

    function handleNavigateBack() {
        router.push(`/inventory`)
    }

    const activeModal = (setOpen: (bool: boolean) => void) => {
        setOpen(true)
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
                        selected && (
                            <Box sx={{ display: "flex" }}>
                                <IconButton color={"inherit"} onClick={() => activeModal(setActivateModalUpdateProduct)}>
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
                    <IconButton sx={{ color: "white" }} onClick={() => activeModal(setActivateModalCreateProduct)}>
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
                    >

                    </TableCell>
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

    const [openImageDialog, setOpenImageDialog] = useState(false)
    const [dialogImages, setDialogImages] = useState([])

    function handleOpenImagesDialog(images: any) {
        setDialogImages(images)
        setOpenImageDialog(true)
    }

    const TableContent = ({ formik }) => {
        return (
            <TableBody>
                {data.filter(
                    item =>
                        item.name.toUpperCase().includes(formik.values.searchBarValue.toUpperCase()) ||
                        item.description.toUpperCase().includes(formik.values.searchBarValue.toUpperCase())).map(
                            row => (
                                <TableRow
                                    key={row.id}
                                    hover
                                    tabIndex={-1}
                                    selected={selected && (row.id === selected.id)}
                                >
                                    <TableCell>
                                        <Checkbox
                                            size={"small"}
                                            checked={selected && (row.id === selected.id)}
                                            onClick={() => handleSelectItem(row)}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Grid container>
                                            {
                                                row.images.length > 0 && (
                                                    <Grid container item xs={12} justifyContent={"center"}>
                                                        <AvatarGroup
                                                            max={3}
                                                            sx={{flexDirection: "row", width: "fit-content"}}
                                                            onClick={() => handleOpenImagesDialog(row.images)}
                                                        >
                                                            {row.images.map(
                                                                imageItem => <Avatar
                                                                    variant={"rounded"}
                                                                    key={`producto-${imageItem.id}`}
                                                                    alt={`producto-${imageItem.id}`}
                                                                    src={imageItem.fileUrl}
                                                                    sx={{cursor: "pointer", border: "1px solid lightblue"}}
                                                                />
                                                            )}
                                                        </AvatarGroup>
                                                    </Grid>
                                                )
                                            }

                                            <Grid container item xs={12} justifyContent={"center"}>
                                                {row.name}
                                            </Grid>
                                        </Grid>
                                    </TableCell>
                                    <TableCell>
                                        {row.description ?? "-"}
                                    </TableCell>
                                    <TableCell>
                                        {row?.departments?.name ?? "-"}
                                    </TableCell>
                                    <TableCell>
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
                                    </TableCell>
                                </TableRow>
                            ))}
            </TableBody>
        )
    }

    async function handleSelectFilter(index: number) {
        let filters = [...allProductsByDepartment]
        filters[index].selected = !filters[index].selected

        setAllProductsByDepartment(filters)
    }

    const DepartmentsFilter = ({ formik }) => {
        const [displaySearchBar, setDisplaySearchBar] = React.useState(false)

        return (
            <Card variant={"outlined"} sx={{ padding: "15px" }}>
                <Grid container rowSpacing={2}>
                    <Grid item>
                        <Typography variant={"subtitle2"}>
                            Seleccione departamentos para encontrar el producto que busca
                        </Typography>
                    </Grid>
                    <Grid container item columnSpacing={2} flexWrap={"nowrap"} sx={{ overflowX: "auto", py: "7px" }}>
                        {
                            allProductsByDepartment.map((item, index) => (
                                <Grid key={item.id} item xs={"auto"}>
                                    <DepartmentCustomButton
                                        title={item.name}
                                        subtitle={item.products?.length === 1 ? `${item.products.length!}` + " producto" : `${item.products?.length!}` + " productos"}
                                        selected={item.selected}
                                        onClick={() => handleSelectFilter(index)}
                                    />
                                </Grid>
                            ))
                        }
                    </Grid>

                    {
                        data?.length > 0 && (
                            <Grid container item rowSpacing={1}>
                                <Grid item xs={12}>
                                    <Typography variant={"subtitle2"}>
                                        Puede buscar productos por nombre o descripción en los departamentos seleccionados aquí
                                        <IconButton
                                            onClick={() => setDisplaySearchBar(!displaySearchBar)}
                                            sx={{ ml: "5px" }}
                                        >
                                            {displaySearchBar
                                                ? <ExpandMoreOutlined fontSize={"small"} />
                                                : <ExpandLessOutlined fontSize={"small"} />
                                            }
                                        </IconButton>
                                    </Typography>
                                </Grid>
                                {
                                    displaySearchBar && (
                                        <Grid item xs={12}>
                                            <TextField
                                                name={"handleChangeSearchBarValue"}
                                                placeholder="Buscar producto..."
                                                size={"small"}
                                                fullWidth
                                                {...formik.getFieldProps("searchBarValue")}
                                            />
                                        </Grid>
                                    )
                                }
                            </Grid>
                        )
                    }
                </Grid>

            </Card>
        )
    }

    const initialValues = {
        searchBarValue: ""
    }

    return (
        <>
            <ImagesDisplayDialog
                open={openImageDialog}
                setOpen={setOpenImageDialog}
                images={dialogImages}
            />

            <ModalUpdateProduct
                open={activateModalCreateProduct}
                setOpen={setActivateModalCreateProduct}
                dialogTitle="Crear Producto"
            >
                <ProductsForm
                    userId={userId}
                    departments={departments}
                    productId={null}
                    setForceRender={setForceRender}
                    setOpen={setActivateModalCreateProduct}
                />
            </ModalUpdateProduct>

            <ModalUpdateProduct
                open={activateModalUpdateProduct}
                setOpen={setActivateModalUpdateProduct}
                dialogTitle="Modificar Producto"
            >
                <ProductsForm
                    userId={userId}
                    departments={departments}
                    productId={selected?.id}
                    setForceRender={setForceRender}
                    setOpen={setActivateModalUpdateProduct}
                />
            </ModalUpdateProduct>

            <Formik
                initialValues={initialValues}
                onSubmit={() => {

                }}
            >
                {
                    (formik) => (
                        <Card variant={"outlined"}>
                            <CustomToolbar />

                            <CardContent>
                                {
                                    allProductsByDepartment.length > 0 && (
                                        <DepartmentsFilter formik={formik} />
                                    )
                                }

                                {
                                    data?.length > 0
                                        ? (
                                            <TableContainer sx={{ width: "100%", overflowX: "auto" }}>
                                                <Table sx={{ width: "100%" }} size={"small"}>
                                                    <TableHeader />

                                                    <TableContent formik={formik} />
                                                </Table>
                                            </TableContainer>
                                        ) : (
                                            <TableNoData />
                                        )
                                }
                            </CardContent>
                        </Card>
                    )
                }
            </Formik>
        </>
    )
}