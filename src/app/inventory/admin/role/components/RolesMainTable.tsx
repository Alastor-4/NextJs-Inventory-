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
import roles from "../request/roles";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface RolesMainTableProps {
    userId?: number;
}

export default function RolesMainTable({ userId }: RolesMainTableProps) {
    const router = useRouter();

    const [data, setData] = React.useState(null);

    //get initial data
    React.useEffect(() => {
        const getAllRoles = async () => {
            const newData = await roles.allRoles(userId)
            setData(newData)
        }
        if (data === null) {
            getAllRoles();
        }
    }, [data, userId])

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
        const response = await roles.delete(userId, selected.id)
        if (response) {
            const updatedRoles = await roles.allRoles(userId)
            if (updatedRoles) setData(updatedRoles)
        }
    }

    async function handleUpdate() {
        router.push(`/inventory/admin/role/update/${selected.id}`)
    }

    function handleNavigateBack() {
        router.push("/inventory")
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
                        Roles
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

                    <Link href={`/inventory/admin/role/create`}>
                        <IconButton sx={{color: "white"}}>
                            <AddOutlined />
                        </IconButton>
                    </Link>
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

    const TableContent = () => {
        return (
            <TableBody>
                {data.map(row => (
                    <TableRow
                        key={row.id}
                        hover
                        tabIndex={-1}
                    >
                        <TableCell>
                            <Checkbox
                                size={"small"} checked={selected && (row.id === selected.id)}
                                onClick={() => handleSelectItem(row)}
                            />
                        </TableCell>
                        <TableCell>
                            {row.name}
                        </TableCell>
                        <TableCell>
                            {row.description}
                        </TableCell>
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