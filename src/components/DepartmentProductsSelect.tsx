// @ts-nocheck
import {
    Card,
    CardContent,
    Checkbox,
    Grid,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableContainer,
    TableRow,
    TextField,
    Typography
} from "@mui/material";
import React from "react";
import { TableNoData } from "@/components/TableNoData";
import { Formik } from "formik";
import DepartmentCustomButton from "./DepartmentCustomButton";

export default function DepartmentProductsSelect(
    { departmentProductsList, setDepartmentProductsList, selectedProduct, setSelectedProduct }: any
) {
    const [data, setData] = React.useState([]);

    React.useEffect(() => {
        if (departmentProductsList.length) {
            let allProducts = [];

            departmentProductsList.forEach((departmentItem) => {
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

    }, [departmentProductsList])

    function handleSelectFilter(index: number) {
        let filters = [...departmentProductsList]
        filters[index].selected = !filters[index].selected

        setDepartmentProductsList(filters)
    }

    const initialValues = {
        searchBarValue: ""
    }

    const DepartmentsFilter = ({ formik }) => (
        <Card variant={"outlined"} sx={{ padding: "15px" }}>
            <Grid container rowSpacing={2}>
                <Grid item>
                    <Typography variant={"subtitle2"}>
                        Seleccione departamentos para encontrar el producto que busca
                    </Typography>
                </Grid>
                <Grid container item columnSpacing={2}>
                    {
                        departmentProductsList.map((item, index) => (
                            <Grid key={item.id} item xs={"auto"}>
                                <DepartmentCustomButton
                                    title={item.name!}
                                    subtitle={item.products?.length === 1 ? `${item.products.length!}` + " producto" : `${item.products?.length!}` + " productos"}
                                    selected={item.selected!}
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
            {
                id: "image",
                label: "",
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

    const handleSelectItem = (item) => {
        if (selectedProduct && (selectedProduct.id === item.id)) {
            setSelectedProduct(null)
        } else {
            setSelectedProduct(item)
        }
    }

    const TableContent = ({ formik }) => {
        return (
            <TableBody>
                {data.filter(
                    item =>
                        item.name.toUpperCase().includes(formik.values.searchBarValue.toUpperCase()) ||
                        item?.description?.toUpperCase()?.includes(formik.values.searchBarValue.toUpperCase())).map(
                            row => (
                                <TableRow
                                    key={row.id}
                                    hover
                                    tabIndex={-1}
                                    selected={selectedProduct && (row.id === selectedProduct.id)}
                                    onClick={() => handleSelectItem(row)}
                                >
                                    <TableCell>
                                        <Checkbox size={"small"} checked={selectedProduct && (row.id === selectedProduct.id)} />
                                    </TableCell>
                                    <TableCell>
                                        {row.name}
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
                                    <TableCell>
                                        {
                                            row.images.length > 0
                                                ? `${row.images.length} imagen(es)` : "-"
                                        }
                                    </TableCell>
                                </TableRow>
                            ))}
            </TableBody>
        )
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
                        <CardContent>
                            {
                                departmentProductsList.length > 0 && (
                                    <DepartmentsFilter formik={formik} />
                                )
                            }

                            {
                                data?.length > 0
                                    ? (
                                        <Grid item xs={12}>
                                            <TableContainer sx={{ width: "100%", overflowX: "auto" }}>
                                                <Table sx={{ width: "100%" }} size={"small"}>
                                                    <TableHeader />
                                                    <TableContent formik={formik} />
                                                </Table>
                                            </TableContainer>
                                        </Grid>
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