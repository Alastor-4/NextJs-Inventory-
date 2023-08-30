"use client"

import React from "react";
import {
    AppBar,
    Box, Button,
    Card,
    CardContent,
    Checkbox, Chip, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle,
    Divider, FormControl, Grid,
    IconButton, InputLabel, MenuItem, OutlinedInput, Select, SelectChangeEvent,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Toolbar,
    Typography
} from "@mui/material";
import {TableNoData} from "@/components/TableNoData";
import {AddOutlined, ArrowLeft, ChangeCircleOutlined, DeleteOutline, EditOutlined} from "@mui/icons-material";
import Link from "next/link";
import {useParams, useRouter} from "next/navigation";
import products from "@/app/profile/[id]/product/requests/products";
import ownerUsers from "@/app/profile/[id]/worker/requests/ownerUsers";
import users from "@/app/user/requests/users";

const fetcher = (url) => fetch(url).then((res) => res.json())

export default function UserWarehouseMainTable(props) {
    const { ownerId, warehouseId } = props

    const [data, setData] = React.useState(null)

    const params = useParams()
    const router = useRouter()

    //ToDo: use global isLoading
    const isLoading = false

    //get initial data
    React.useEffect(() => {
        fetcher(`/profile/${ownerId}/warehouse/${warehouseId}/api`).then((data) => setData(data))
    }, [ownerId, warehouseId])

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
        const response = await ownerUsers.deleteWorker(selected.id)
        if (response) {
            const allUsers = await ownerUsers.allWorkers(params.id)
            if (allUsers) setData(allUsers)
        }
    }

    function handleNavigateBack() {
        router.back()
    }

    const CustomToolbar = () => (
        <AppBar position={"static"} variant={"elevation"} color={"primary"}>
            <Toolbar sx={{display: "flex", justifyContent: "space-between", color: "white"}}>
                <Box sx={{display: "flex", alignItems: "center"}}>
                    <IconButton color={"inherit"} sx={{mr: "10px"}} onClick={handleNavigateBack}>
                        <ArrowLeft fontSize={"large"}/>
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
                        Depósitos en almacén
                    </Typography>
                </Box>

                <Box sx={{display: "flex"}}>
                    {
                        isLoading
                            ? <CircularProgress size={24} color={"inherit"}/>
                            : (
                                <>
                                    {
                                        selected && (
                                            <Box sx={{display: "flex"}}>
                                                <IconButton color={"inherit"} onClick={handleClickOpenDialog}>
                                                    <ChangeCircleOutlined fontSize={"small"}/>
                                                </IconButton>

                                                <IconButton color={"inherit"} onClick={handleRemove}>
                                                    <DeleteOutline fontSize={"small"}/>
                                                </IconButton>

                                                <Divider orientation="vertical" variant="middle" flexItem
                                                         sx={{borderRight: "2px solid white", mx: "5px"}}/>
                                            </Box>
                                        )
                                    }

                                    <Link href={`/profile/${params.id}/worker/create`}>
                                        <IconButton color={"inherit"}>
                                            <AddOutlined/>
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
                id: "department",
                label: "Departamento",
                align: "left"
            },
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
                        selected={selected && (row.id === selected.id)}
                        onClick={() => handleSelectItem(row)}
                    >
                        <TableCell>
                            <Checkbox size={"small"} checked={selected && (row.id === selected.id)}/>
                        </TableCell>
                        <TableCell>
                            {row.products.departments?.name ?? "-"}
                        </TableCell>
                        <TableCell>
                            {row.products.name}
                        </TableCell>
                        <TableCell>
                            {row.products.description ?? "-"}
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        )
    }

    return (
        <Card variant={"outlined"}>
            <CustomToolbar/>

            <CardContent>
                {
                    data?.length > 0
                        ? (
                            <Table sx={{width: "100%"}} size={"small"}>
                                <TableHeader/>

                                <TableContent/>
                            </Table>
                        ) : (
                            <TableNoData/>
                        )
                }
            </CardContent>
        </Card>
    )
}