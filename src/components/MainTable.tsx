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
import {TableNoData} from "@/components/TableNoData";
import {AddOutlined, DeleteOutline, EditOutlined, RemoveOutlined} from "@mui/icons-material";


export default function MainTable({title, headCells, items}) {
    //table selected item
    const [selected, setSelected] = React.useState(null)
    const handleSelectItem = (item) => {
        if (selected && (selected.id === item.id)) {
            setSelected(null)
        } else {
            setSelected(item)
        }
    }

    const CustomToolbar = () => (
        <AppBar position={"static"} variant={"elevation"} color={"primary"}>
            <Toolbar sx={{display: "flex", justifyContent: "space-between", color: "white"}}>
                <Box>
                    <Typography
                        variant="h6"
                        noWrap
                        sx={{
                            fontWeight: 700,
                            letterSpacing: ".2rem",
                            color: "white",
                        }}
                    >
                        {title}
                    </Typography>
                </Box>

                <Box sx={{display: "flex"}}>
                    {
                        selected && (
                            <Box sx={{display: "flex"}}>
                                <IconButton color={"inherit"}>
                                    <EditOutlined fontSize={"small"}/>
                                </IconButton>

                                <IconButton color={"inherit"}>
                                    <DeleteOutline fontSize={"small"}/>
                                </IconButton>

                                <Divider orientation="vertical" variant="middle" flexItem sx={{borderRight: "2px solid white", mx: "5px"}}/>
                            </Box>
                        )
                    }

                    <IconButton color={"inherit"}>
                        <AddOutlined/>
                    </IconButton>
                </Box>
            </Toolbar>
        </AppBar>
    )

    const TableHeader = ({headCellsParam}) => {
        return (
            <TableHead>
                <TableRow>
                    <TableCell
                        key={"checkbox"}
                        align={"left"}
                        padding={'checkbox'}
                    >

                    </TableCell>
                    {headCellsParam.map(headCell => (
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

    const TableContent = ({itemsParam, headCellsParam}) => {
        return (
            <TableBody>
                {itemsParam.map(row => (
                    <TableRow
                        key={row.id}
                        hover
                        tabIndex={-1}
                        onClick={() => handleSelectItem(row)}
                    >
                        <TableCell>
                            <Checkbox size={"small"} checked={selected && (row.id === selected.id)}/>
                        </TableCell>

                        {
                            headCellsParam.map(headCell => (
                                <TableCell key={headCell.id}>
                                    {row[headCell.id]}
                                </TableCell>
                            ))
                        }
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
                    items.length > 0 && headCells.length > 0
                        ? (
                            <Table sx={{width: "100%"}} size={"small"}>
                                <TableHeader headCellsParam={headCells}/>
                                <TableContent itemsParam={items} headCellsParam={headCells}/>
                            </Table>
                        ) : (
                            <TableNoData/>
                        )
                }
            </CardContent>
        </Card>
    )
}