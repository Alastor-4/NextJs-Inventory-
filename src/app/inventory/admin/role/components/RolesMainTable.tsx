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
    TableCell,
    TableHead,
    TableRow,
    Toolbar,
    Typography
} from "@mui/material";
import { TableNoData } from "@/components/TableNoData";
import { AddOutlined, ArrowLeft, DeleteOutline, EditOutlined } from "@mui/icons-material";
import roles from "../request/roles";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

export default function RolesMainTable() {
    const params = useParams();

    const router = useRouter()

    const [data, setData] = React.useState(null)

    //get initial data
    React.useEffect(() => {
        //fetcher("/role/api").then((data) => setData(data))
        const getAllRoles = async () => {
            const newData = await roles.allRoles(params.id)
            setData(newData)
        }
        if (data === null) {
            getAllRoles();
        }
    }, [data, params.id])

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
        const response = await roles.delete(params.id, selected.id)
        if (response) {
            const updatedRoles = await roles.allRoles(params.id)
            if (updatedRoles) setData(updatedRoles)
        }
    }

    async function handleUpdate() {
        router.push(`/profile/${params.id}/admin/role/update/${selected.id}`)
    }

    function handleNavigateBack() {
        router.push(`/profile/${params.id}`)
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
                        Listado de roles
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

                    <Link href={`/profile/${params.id}/admin/role/create`}>
                        <IconButton color={"inherit"}>
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
                        onClick={() => handleSelectItem(row)}
                    >
                        <TableCell>
                            <Checkbox size={"small"} checked={selected && (row.id === selected.id)} />
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
                            <Table sx={{ width: "100%" }} size={"small"}>
                                <TableHeader />

                                <TableContent />
                            </Table>
                        ) : (
                            <TableNoData />
                        )
                }
            </CardContent>
        </Card>
    )
}