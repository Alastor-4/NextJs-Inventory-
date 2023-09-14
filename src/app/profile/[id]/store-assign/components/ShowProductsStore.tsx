"use client"

import React, {useEffect, useState} from 'react'
import storeAssign from '@/app/profile/[id]/store-assign/requests/store-assign';
import InputTableCell from '@/app/profile/[id]/store-assign/components/InputTableCell';
import {TableNoData} from "@/components/TableNoData";
import {useParams} from 'next/navigation';
import {
    Button,
    Card,
    CardContent,
    Grid,
    IconButton,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    TextField,
    Typography
} from '@mui/material';
import {RemoveOutlined} from '@mui/icons-material';
import {Formik} from 'formik';

function ShowProductsStore({storeId}) {

    const [allProductStore, setAllProductStore] = useState(null);
    const [data, setData] = useState()
    const [productsInputValue, setProductsInputValue] = useState([]);

    const params = useParams()

    useEffect(() => {
        setAllProductStore(null);
    }, [storeId])

    useEffect(() => {

        const Datos = async () => {
            const result = await storeAssign.allProductsbyDepartmentStore(params.id, storeId)
            setAllProductStore(() => result.map(data => ({
                ...data,
                selected: false
            })));
        }

        if (allProductStore === null) {
            Datos()
        }
    }, [allProductStore, setAllProductStore])


    useEffect(() => {
        if (allProductStore !== null) {

            let allProducts = []

            allProductStore.forEach((departmentItem) => {
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

            let newMap = new Map()

            productsInputValue.forEach(element => newMap.set(element.id, element.value));

            const newProductsInputValue = allProducts.map(element => ({
                    id: element.id,
                    value: (newMap.has(element.id)) ? newMap.get(element.id) : '0'
                })
            )

            setProductsInputValue(newProductsInputValue);
            setData(allProducts)
        }

    }, [allProductStore])


    async function handleSelectFilter(index: number) {
        let filters = [...allProductStore]
        filters[index].selected = !filters[index].selected

        setAllProductStore(filters)
    }

    const DepartmentsFilter = ({formik}) => {
        return (
            <Card variant={"outlined"} sx={{padding: "15px"}}>
                <Grid container rowSpacing={2}>
                    <Grid item>
                        <Typography variant={"subtitle2"}>
                            Seleccione departamentos para encontrar el producto que busca
                        </Typography>
                    </Grid>
                    <Grid container item columnSpacing={2}>
                        {
                            allProductStore.map((item, index) => (
                                <Grid key={item.id} item xs={"auto"}>
                                    <Button variant={item.selected ? "contained" : "outlined"}
                                            onClick={() => handleSelectFilter(index)}>
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
                                        Puede buscar productos por nombre o descripción en los departamentos seleccionados
                                        aquí
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
        searchBarValue: "",
    }


    const TableHeader = () => {
        const headCells = [
            {
                id: "name",
                label: "Nombre",
                align: "left"
            },
            {
                id: "store_units",
                label: "Unidades en la tienda",
                align: "left"
            },
            {
                id: "warehouse_units",
                label: "Unidades en el almacen",
                align: "left"
            },
            {
                id: "department",
                label: "Departamento",
                align: "left"
            },
            {
                id: "add_remove_units",
                label: "Retirar/Agregar unidades",
                align: "left"
            },
            {
                id: "remove",
                label: "Enviar producto al almacen",
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
    const loadDates = async () => {
        let newAllProductStore = await storeAssign.allProductsbyDepartmentStore(params.id, storeId);

        let selectedDepartment = allProductStore.filter(element => (element.selected)).map(element => element.id)

        newAllProductStore = newAllProductStore.map(element => ({
            ...element,
            selected: (selectedDepartment.includes(element.id))
        }))
        setAllProductStore(newAllProductStore);
    }

    const updateDepot = async (addUnits, depot) => {
        depot.product_total_remaining_units += addUnits;
        const result = await storeAssign.UpdateProductWarehouse(params.id, depot)
        if (result.status === 200) {
            loadDates();
        }
    }

    const removeProduct = async (index) => {

        const result = await storeAssign.RemoveProductStore(params.id, data[index].depots[0].store_depots[0].id)

        if (result.status === 200) {
            updateDepot(data[index].depots[0].store_depots[0].product_remaining_units, data[index].depots[0]);
        }


    }

    const TableContent = ({formik}) => {
        return (
            <TableBody>
                {data.filter(
                    item =>
                        item.name.toUpperCase().includes(formik.values.searchBarValue.toUpperCase())).map(
                    (row, index) => (
                        <TableRow
                            key={row.id}
                            hover
                            tabIndex={-1}
                        >
                            <TableCell>
                                {row.name}
                            </TableCell>

                            <TableCell>
                                {row.depots[0].store_depots[0].product_remaining_units}
                            </TableCell>

                            <TableCell>
                                {row.depots[0].product_total_remaining_units}
                            </TableCell>

                            <TableCell>
                                {row?.departments?.name ?? "-"}
                            </TableCell>

                            <TableCell>
                                <InputTableCell
                                    warehouseUnits={row.depots[0].product_total_remaining_units}
                                    storeUnits={row.depots[0].store_depots[0].product_remaining_units}
                                    storeDepot={row.depots[0].store_depots[0]}
                                    updateDepot={updateDepot}
                                    depot={row.depots[0]}
                                    setProductsInputValue={setProductsInputValue}
                                    defaultValue={productsInputValue}
                                    index={index}
                                />
                            </TableCell>

                            <TableCell>
                                <IconButton color={"primary"} onClick={() => removeProduct(index)}>
                                    <RemoveOutlined/>
                                </IconButton>
                            </TableCell>
                        </TableRow>
                    ))}
            </TableBody>
        )
    }


    return (
        <div>

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
                                    Array.isArray(allProductStore) && allProductStore.length > 0 && (
                                        <DepartmentsFilter formik={formik}/>
                                    )
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

        </div>
    )
}

export default ShowProductsStore
