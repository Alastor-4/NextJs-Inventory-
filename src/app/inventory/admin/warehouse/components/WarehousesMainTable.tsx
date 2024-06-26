// @ts-nocheck
"use client"

import React from "react";
import {
    AppBar,
    Box,
    Card,
    CardContent,
    Checkbox,
    Divider,
    IconButton,
    Table,
    TableBody,
    TableCell, TableContainer,
    TableHead,
    TableRow,
    Toolbar,
    Typography
} from "@mui/material";
import { TableNoData } from "@/components/TableNoData";
import { AddOutlined, ArrowLeft, DeleteOutline, EditOutlined } from "@mui/icons-material";
import warehouses from "../requests/warehouses";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function WarehousesMainTable({ userId }) {
    const router = useRouter()

    const [data, setData] = React.useState(null)

    //get initial data
    React.useEffect(() => {
        const getAllWarehouse = async () => {
            const newData = await warehouses.allWarehouses()
            setData(newData)
        }

        if (data === null) {
            getAllWarehouse()
        }
    }, [data]);

    //table selected item
    const [selected, setSelected] = React.useState(null)
    const handleSelectItem = (item) => {
        if (selected && (selected.id === item.id)) {
            setSelected(null)
        } else {
            setSelected(item)
        }
    }

    async function handleRemove() {
        const response = await warehouses.delete(selected.id)
        if (response) {
            const updatedWarehouses = await warehouses.allWarehouses()
            if (updatedWarehouses) setData(updatedWarehouses)
        }
    }

    async function handleUpdate() {
        router.push(`/inventory/admin/warehouse/update/${selected.id}`)
    }

    function handleNavigateBack() {
        router.push(`/inventory`)
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
                        Almacenes
                    </Typography>
                </Box>

                <Box sx={{ display: "flex" }}>
                    {
                        selected && (
                            <Box sx={{ display: "flex" }}>
                                <IconButton color={"inherit"} onClick={handleUpdate}>
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

                    <Link href={`/inventory/admin/warehouse/create`}>
                        <IconButton sx={{ color: "white" }}>
                            <AddOutlined />
                        </IconButton>
                    </Link>
                </Box>
            </Toolbar>
        </AppBar>
    )

    const TableHeader = () => {
        const headCells = [
            { id: "owner", label: "Dueño", },
            { id: "name", label: "Nombre", },
            { id: "description", label: "Descripción", },
            { id: "address", label: "Dirección", },
        ]

        return (
            <TableHead>
                <TableRow>
                    <TableCell
                        key={"checkbox"}
                        align={"center"}
                        padding={'checkbox'}
                    >

                    </TableCell>
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

    const TableContent = () => {
        return (
            <TableBody>
                {data.map(row => (
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
                        <TableCell sx={{ whiteSpace: "nowrap" }} align="center">{row.users.name}</TableCell>
                        <TableCell sx={{ whiteSpace: "nowrap" }} align="center">{row.name ?? "-"}</TableCell>
                        <TableCell sx={{ whiteSpace: "nowrap" }} align="center">{row.description ?? "-"}</TableCell>
                        <TableCell sx={{ whiteSpace: "nowrap" }} align="center">{row.address ?? "-"}</TableCell>
                    </TableRow>
                ))}
            </TableBody>
        )
    }

    return (
        <Card variant={"outlined"}>
            <CustomToolbar />

            <CardContent>
                {
                    data?.length > 0
                        ? (
                            <TableContainer sx={{ width: "100%", overflowX: "auto" }}>
                                <Table sx={{ width: "100%" }} size={"small"}>
                                    <TableHeader />

                                    <TableContent />
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