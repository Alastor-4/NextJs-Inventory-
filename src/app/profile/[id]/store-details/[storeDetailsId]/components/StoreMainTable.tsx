"use client"

import React from "react";
import {
    AppBar,
    Box, Button,
    Card,
    CardContent,
    Checkbox, CircularProgress,
    Divider, Grid,
    IconButton,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow, TextField,
    Toolbar,
    Typography
} from "@mui/material";
import { TableNoData } from "@/components/TableNoData";
import { AddOutlined, ArrowLeft } from "@mui/icons-material";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Formik } from "formik";
import stores from "@/app/profile/[id]/store/requests/stores"

const fetcher = (url) => fetch(url).then((res) => res.json())

export default function StoreMainTable() {
    const params = useParams()
    const router = useRouter()

    const [data, setData] = React.useState(null)
    const [allProductsByDepartment, setAllProductsByDepartment] = React.useState([])
    const [storeName, setStoreName] = React.useState('')
    //ToDo: use global isLoading
    const isLoading = false

    //get initial data
    React.useEffect(() => {
        fetcher(`/profile/${params.id}/store-details/${params.storeDetailsId}/api`).then((data) =>
            setAllProductsByDepartment(data.map(item => ({
                ...item,
                selected: false
            }))))
    }, [params.id, params.storeDetailsId])

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

    //Get Store name
    React.useEffect(() => {
        const dataStore = async () => {
            const newStoreName = await stores.storeDetails(params.id, params.storeDetailsId);
            setStoreName(newStoreName.name);
        }
        if (storeName === '') {
            dataStore()
        }

    }, [storeName,setStoreName])

    function handleNavigateBack() {
        router.back()
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
                        {storeName}
                    </Typography>
                </Box>

                <Box sx={{ display: "flex" }}>
                    {
                        isLoading
                            ? <CircularProgress size={24} color={"inherit"} />
                            : (
                                <>
                                    <Link href={`/profile/${params.id}/product/create`}>
                                        <IconButton color={"inherit"}>
                                            <AddOutlined />
                                        </IconButton>
                                    </Link>
                                </>
                            )
                    }
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
                id: "departaments",
                label: "Departamento",
                align: "left"
            },
            {
                id: "productRemaining",
                label: "Unidades restantes",
                align: "left"
            },
            {
                id: "productUnit",
                label: "Total de unidades",
                align: "left"
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

    const TableContent = ({ formik }) => {
        return (
            <TableBody>
                {data.filter(
                    item =>
                        item.name.toUpperCase().includes(formik.values.searchBarValue.toUpperCase())).map(
                            row => (
                                <TableRow
                                    key={row.id}
                                    hover
                                    tabIndex={-1}
                                >
                                    <TableCell>
                                        {row.name}
                                    </TableCell>
                                    <TableCell>
                                        {row.departments?.name}
                                    </TableCell>
                                    <TableCell>
                                        {row.depots[0].store_depots[0].product_remaining_units}
                                    </TableCell>
                                    <TableCell>
                                        {row.depots[0].store_depots[0].product_units}
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
        return (
            <Card variant={"outlined"} sx={{ padding: "15px" }}>
                <Grid container rowSpacing={2}>
                    <Grid item>
                        <Typography variant={"subtitle2"}>
                            Seleccione departamentos para encontrar el producto que busca
                        </Typography>
                    </Grid>
                    <Grid container item columnSpacing={2}>
                        {
                            allProductsByDepartment.map((item, index) => (
                                <Grid key={item.id} item xs={"auto"}>
                                    <Button variant={item.selected ? "contained" : "outlined"} onClick={() => handleSelectFilter(index)}>
                                        <Grid container>
                                            <Grid item xs={12}>
                                                {item.name}
                                            </Grid>
                                            <Grid container item xs={12} justifyContent={"center"}>
                                                <Typography variant={"caption"}>
                                                    {item.products.length} productos
                                                </Typography>
                                            </Grid>
                                        </Grid>
                                    </Button>
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
                                    </Typography>
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        name={"handleChangeSearchBarValue"}
                                        placeholder="Buscar producto..."
                                        size={"small"}
                                        fullWidth
                                        {...formik.getFieldProps("searchBarValue")}
                                    />
                                </Grid>
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
                                        <Table sx={{ width: "100%" }} size={"small"}>
                                            <TableHeader />

                                            <TableContent formik={formik} />
                                        </Table>
                                    ) : (
                                        <TableNoData />
                                    )
                            }
                        </CardContent>
                    </Card>

                )
            }
        </Formik>
    )

}