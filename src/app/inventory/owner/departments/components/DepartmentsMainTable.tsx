"use client"

import {
    AppBar, Box, Card, CardContent, Checkbox, Divider, Grid, IconButton, InputBase, Table, TableBody, TableCell,
    TableContainer,
    TableHead, TableRow, Toolbar, Typography
} from "@mui/material";
import { DepartmentsMainTableProps, departmentsWithProductsCount, allProductsByDepartmentProps } from "@/types/interfaces";
import { AddOutlined, ArrowLeft, DeleteOutline, EditOutlined, HelpOutline } from "@mui/icons-material";
import ModalCreateUpdateDepartment from "./Modal/ModalCreateUpdateDepartment";
import { notifyError, notifySuccess } from "@/utils/generalFunctions";
import departmentsRequests from "../requests/departments";
import { useStoreHook } from "@/app/store/useStoreHook";
import { TableNoData } from "@/components/TableNoData";
import React, { useEffect, useState } from "react";
import { useStore } from "@/app/store/store";
import { useRouter } from "next/navigation";
import { Formik } from "formik";
import InfoTooltip from "@/components/InfoTooltip";
import SearchIcon from '@mui/icons-material/Search';

export const DepartmentsMainTable = ({ userId }: DepartmentsMainTableProps) => {
    const router = useRouter();

    const store = useStoreHook(useStore, (state) => state.ownerDepartmentsCount);

    //Departments data
    const [allDepartmentsData, setAllDepartmentsData] = useState<departmentsWithProductsCount[] | null>(null);
    const [selectedDepartment, setSelectedDepartment] = useState<departmentsWithProductsCount | null>(null);

    const [forceRender, setForceRender] = useState<boolean>(false);

    const handleForceRender = () => {
        setForceRender(true);
        setSelectedDepartment(null);
    }

    //GET initial data
    useEffect(() => {
        const getAllDepartments = async () => {
            const newAllDepartments: departmentsWithProductsCount[] | null = await departmentsRequests.getAllUserDepartments(+userId);
            if (newAllDepartments) {
                setAllDepartmentsData(newAllDepartments);
                setForceRender(false);
                setSelectedDepartment(null);
            }
        }
        getAllDepartments();
    }, [userId, forceRender, allDepartmentsData]);

    //Modals handlers
    const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
    const [isUpdateModalOpen, setIsUpdateModalOpen] = useState<boolean>(false);

    const toggleModalCreate = () => setIsCreateModalOpen(!isCreateModalOpen);
    const toggleModalUpdate = () => setIsUpdateModalOpen(!isUpdateModalOpen);

    //Update allDepartments at change
    // useEffect(() => {
    //     if (allProductsByDepartment?.length) {
    //         let allProducts: productsProps[] = [];
    //         let bool = false;
    //         if (selectedDepartments) {
    //             for (const department of selectedDepartments!) if (department.selected === true) bool = true;
    //         }
    //         allProductsByDepartment?.forEach((productsByDepartments) => {
    //             if (!selectedDepartments || selectedDepartments?.length! === 0 || !bool) {
    //                 allProducts = [...allProducts, ...productsByDepartments.products!];
    //             }
    //             if (selectedDepartments?.length! > 0 && bool) {
    //                 if (productsByDepartments.selected) {
    //                     allProducts = [...allProducts, ...productsByDepartments.products!];
    //                 }
    //             }
    //         });

    //         allProducts.sort((a: productsProps, b: productsProps) => {
    //             if (a?.name! < b?.name!) return -1;
    //             if (a?.name! > a?.name!) return 1;
    //             return 0;
    //         });
    //         setDataProducts(allProducts);
    //     }
    // }, [allProductsByDepartment, selectedDepartments, isFilterModalOpen]);

    //Handle selected department
    const handleSelectDepartment = (department: departmentsWithProductsCount) => {
        if (selectedDepartment && (selectedDepartment.id === department.id)) {
            setSelectedDepartment(null);
        } else {
            setSelectedDepartment(department);
        }
    }

    const [isOpenTooltip, setIsOpenTooltip] = useState<boolean>(false);
    const handleTooltipClose = () => setIsOpenTooltip(false);
    const handleTooltipOpen = () => setIsOpenTooltip(true);

    //Handle delete department
    const handleRemove = async () => {
        const response = await departmentsRequests.deleteDepartment(selectedDepartment?.id!);
        if (response) {
            setSelectedDepartment(null);
            handleForceRender();
            notifySuccess("Se ha eliminado el departamento");
        } else {
            notifyError("Error al eliminar el departamento");
        }
    }

    const handleNavigateBack = () => router.push(`/inventory`);

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
                            letterSpacing: ".15rem",
                            color: "white",
                        }}
                    >
                        Departamentos
                    </Typography>
                </Box>

                <Box sx={{ display: "flex" }}>
                    {
                        selectedDepartment && (
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
            { id: "name", label: "Nombre", },
            { id: "description", label: "Descripción", },
            { id: "products", label: "Productos", },
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
        const filteredDepartments = allDepartmentsData?.filter(
            (department: departmentsWithProductsCount) =>
                department?.name?.toUpperCase().includes(formik.values.searchBarValue.toUpperCase()) ||
                department?.description?.toUpperCase().includes(formik.values.searchBarValue.toUpperCase()));
        return (
            <TableBody >
                {filteredDepartments?.map(
                    (department: departmentsWithProductsCount) => (
                        <TableRow
                            key={department.id}
                            hover
                            tabIndex={-1}
                            selected={!!selectedDepartment && (department.id === selectedDepartment.id)}
                        >
                            <TableCell>
                                <Checkbox
                                    size={"small"}
                                    checked={!!selectedDepartment && (department.id === selectedDepartment.id)}
                                    onClick={() => handleSelectDepartment(department)}
                                    sx={{ width: "5px" }}
                                />
                            </TableCell>
                            <TableCell>{department.name ?? "-"}</TableCell>
                            <TableCell>{department.description ?? "-"}</TableCell>
                            <TableCell>{department.products}</TableCell>
                        </TableRow>
                    ))}
            </TableBody>
        )
    }

    return (
        <>
            <ModalCreateUpdateDepartment
                isOpen={isCreateModalOpen}
                setIsOpen={toggleModalCreate}
                userId={userId}
                handleForceRender={handleForceRender}
                dialogTitle={"Añadir Departamento"}
            />

            <ModalCreateUpdateDepartment
                isOpen={isUpdateModalOpen}
                setIsOpen={toggleModalUpdate}
                userId={userId}
                handleForceRender={handleForceRender}
                department={selectedDepartment}
                dialogTitle={"Modificar Departamento"}
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
                                                message={"Puede buscar por nombre y descripción"}
                                            >
                                                <IconButton onClick={handleTooltipOpen}>
                                                    <HelpOutline />
                                                </IconButton>
                                            </InfoTooltip>
                                        </Grid>
                                    </Grid>
                                    <Grid item container xs={12} md={12} justifyContent={"center"} alignItems="center">
                                        <Grid item container xs={8} border={"1px solid gray"} borderRadius={"5px"} margin="4px" position="relative" >
                                            <Grid item position="absolute" height="100%" paddingLeft="4px" display="flex" alignItems="center" justifyContent="center" >
                                                <SearchIcon color="action" />
                                            </Grid>
                                            <Grid item width="100%" paddingLeft="35px" >
                                                <InputBase
                                                    placeholder="Buscar departamento..."
                                                    inputProps={{ 'aria-label': 'search' }}
                                                    {...formik.getFieldProps("searchBarValue")}
                                                />
                                            </Grid>
                                        </Grid>
                                    </Grid>
                                </Card>
                                <Card variant={"outlined"} sx={{ paddingTop: "20px" }}>
                                    <Grid container rowSpacing={2}>
                                        {
                                            allDepartmentsData?.length! > 0
                                                ? (allDepartmentsData?.filter(
                                                    (department: departmentsWithProductsCount) =>
                                                        department?.name?.toUpperCase().includes(formik.values.searchBarValue.toUpperCase()) ||
                                                        department?.description?.toUpperCase().includes(formik.values.searchBarValue.toUpperCase())).length! > 0 ?
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

export default DepartmentsMainTable;