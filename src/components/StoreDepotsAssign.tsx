import {
    Button,
    Card,
    CardContent,
    Checkbox,
    Grid, MenuItem,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    TextField,
    Typography
} from "@mui/material";
import React from "react";
import {Formik} from "formik";
import {TableNoData} from "@/components/TableNoData";
import * as Yup from "yup";

export default function StoreDepotsAssign(
    {storeListProp, depotsByDepartmentsListProp, selectedDepotProp}
) {
    const [data, setData] = React.useState([])

    //ToDo: when there is a selectedDepotProp, corresponding department filter must be selected to
    //ToDo: get all store_depots for every selected store

    const initialValues = {
        selectedStore: storeListProp.length === 1 ? storeListProp[0] : "",
        depotList: depotsByDepartmentsListProp.map(item => ({...item, selected: false})),
        selectedDepot: selectedDepotProp ?? "",
        searchBarValue: "",
    }

    const validationSchema = Yup.object({
        selectedStore: Yup.object().required("seleccione una tienda"),
        depotList: Yup.array().of(Yup.object()),
        selectedDepot: Yup.object().required("seleccione un producto"),
        searchBarValue: Yup.string(),
    })

    function handleSelectFilter(formik: any, index: number) {
        let filters = [...formik.values.depotList]
        filters[index].selected = !filters[index].selected

        formik.setFieldValue("depotList", filters)
    }

    const DepartmentsFilter = ({formik}) => (
        <Card variant={"outlined"} sx={{padding: "15px"}}>
            <Grid container rowSpacing={2}>
                <Grid item>
                    <Typography variant={"subtitle2"}>
                        Seleccione departamentos para encontrar el producto que busca
                    </Typography>
                </Grid>
                <Grid container item columnSpacing={2}>
                    {
                        formik.values.depotList.map((item, index) => (
                            <Grid key={item.id} item xs={"auto"}>
                                <Button variant={item.selected ? "contained" : "outlined"}
                                        onClick={() => handleSelectFilter(formik, index)}>
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

    const handleSelectItem = (formik, item) => {
        if (formik.values.selectedDepot?.id === item.id) {
            formik.setFieldValue("selectedDepot", "")
        } else {
            formik.setFieldValue("selectedDepot", item)
        }
    }

    const TableContent = ({formik}) => {
        return (
            <TableBody>
                {data.filter(
                    item =>
                        item.name.toUpperCase().includes(formik.values.searchBarValue.toUpperCase()) ||
                        item.description.toUpperCase().includes(formik.values.searchBarValue.toUpperCase())).map(
                    row => (
                        <TableRow
                            key={row.depots.id}
                            hover
                            tabIndex={-1}
                            selected={formik.values.selectedDepot?.depots.id === row.depots.id}
                            onClick={() => handleSelectItem(formik, row)}
                        >
                            <TableCell>
                                <Checkbox size={"small"}
                                          checked={formik.values.selectedDepot?.depots.id === row.depots.id}/>
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
                                                <Grid container item alignItems={"center"} sx={{marginRight: "3px"}}>
                                                    <Typography variant={"caption"}
                                                                sx={{color: "white", fontWeight: "600"}}>
                                                        {item.name.toUpperCase()}
                                                    </Typography>
                                                </Grid>
                                                <Grid container item alignItems={"center"}
                                                      sx={{color: "rgba(16,27,44,0.8)"}}>
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
            validationSchema={validationSchema}
            onSubmit={() => {

            }}
        >
            {
                (formik) => (
                    <Card variant={"outlined"}>
                        <CardContent>
                            <Grid container>
                                <Grid item xs={12}>
                                    <TextField
                                        name={"selectedStore"}
                                        label="Tienda"
                                        size={"small"}
                                        fullWidth
                                        select
                                        {...formik.getFieldProps("selectedStore")}
                                        error={formik.errors.selectedStore && formik.touched.selectedStore}
                                        helperText={(formik.errors.selectedStore && formik.touched.selectedStore) && formik.errors.selectedStore}
                                    >
                                        {
                                            storeListProp.map(item => (
                                                <MenuItem key={item.id}
                                                          value={item}>{`${item.name} (${item.description ?? ''})`}</MenuItem>
                                            ))
                                        }
                                    </TextField>
                                </Grid>
                            </Grid>

                            {
                                <DepartmentsFilter formik={formik}/>
                            }

                            {
                                data?.length > 0
                                    ? (
                                        <Table sx={{width: "100%"}} size={"small"}>
                                            <TableHeader/>

                                            <TableContent formik={formik}/>
                                        </Table>
                                    ) : (
                                        <TableNoData/>
                                    )
                            }
                        </CardContent>
                    </Card>
                )
            }
        </Formik>
    )
}