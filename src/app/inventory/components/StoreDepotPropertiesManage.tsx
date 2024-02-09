import {productsProps} from "@/types/interfaces";
import {AddOutlined, DeleteOutline, DescriptionOutlined, EditOutlined} from "@mui/icons-material";
import {Button, Checkbox, Grid, IconButton, TextField, Typography} from "@mui/material";
import {store_depot_properties} from "@prisma/client";
import React from "react";
import GenericFullScreenModal from "@/app/inventory/components/GenericFullScreenModal";
import {Formik} from "formik";
import * as Yup from "yup"
import {CharacteristicInfoTag} from "@/components/InfoTags";
import sellerStoreProduct from "@/app/inventory/seller/store/[sellerStoreId]/product/requests/sellerStoreProduct";
import {notifySuccess} from "@/utils/generalFunctions";


const StoreDepotPropertiesManage = (
    {data, updateFunction}: {
        data: productsProps,
        updateFunction: (storeDepotIndex: number, newStoreDepotProperties: store_depot_properties[]) => void
    }
) => {
    const [localPropertiesData, setLocalPropertiesData] = React.useState<store_depot_properties[] | null>(null)
    const [displayProperties, setDisplayProperties] = React.useState(false)
    const [displayEditForm, setDisplayEditForm] = React.useState(false)

    React.useEffect(() => {
        setLocalPropertiesData(data.depots![0].store_depots![0].store_depot_properties)
    }, [data])

    const [updateNeeded, setUpdateNeeded] = React.useState(false)

    const handleCloseModal = () => {
        setDisplayProperties(false)
        setDisplayEditForm(false)

        if (updateNeeded)
            updateFunction(data.depots![0].store_depots![0].id, localPropertiesData!)
    }

    const initialValues = {
        property: "",
        value: "",
    }

    const validationSchema = Yup.object({
        property: Yup.string().required("valor requerido"),
        value: Yup.string().required("valor requerido"),
    })

    const handleToggleActive = async (propertyItem: store_depot_properties) => {
        const isActive = !propertyItem.is_active
        const response = await sellerStoreProduct.toggleActiveStoreDepotProperty(data.depots![0].store_depots![0].id, propertyItem.id, isActive)

        if (response) {
            setUpdateNeeded(true)

            let newProperties = [...localPropertiesData!]
            const updateIndex = localPropertiesData?.findIndex(item => item.id === response.id)
            newProperties![updateIndex!] = response

            setLocalPropertiesData(newProperties)
            notifySuccess("Propiedad modificada")
        }
    }

    const handleDelete = async (propertyItem: store_depot_properties) => {
        const response = await sellerStoreProduct.deleteStoreDepotProperty(data.depots![0].store_depots![0].id, propertyItem.id)

        if (response) {
            setUpdateNeeded(true)

            let newProperties = localPropertiesData?.filter(item => item.id !== response.id)

            setLocalPropertiesData(newProperties!)
            notifySuccess("Propiedad eliminada")
        }
    }

    const PropertiesList = ({properties}: {properties: store_depot_properties[]}) => (
        <Grid container rowSpacing={2}>
            <Grid container item rowSpacing={1} xs={12}>
                {
                    properties.map(item => (
                        <Grid key={item.id} container item xs={12} rowSpacing={1}>
                            <Grid container item xs={true} alignItems={"center"}>
                                <CharacteristicInfoTag name={item.name} value={item.value} disabled={!item.is_active}/>
                            </Grid>

                            <Grid container item xs={"auto"} alignItems={"center"}>
                                <Checkbox checked={item.is_active} size={"small"} onChange={() => handleToggleActive(item)}/>

                                {
                                    displayEditForm && (
                                        <IconButton size={"small"} color={"error"} onClick={() => handleDelete(item)}>
                                            <DeleteOutline fontSize={"small"}/>
                                        </IconButton>
                                    )
                                }
                            </Grid>
                        </Grid>
                    ))
                }
            </Grid>

            <Grid container item xs={12}>
                {
                    displayEditForm
                        ? (
                            <Formik
                                initialValues={initialValues}
                                validationSchema={validationSchema}
                                onSubmit={async values => {
                                    const response = await sellerStoreProduct.createStoreDepotProperty(
                                        data.depots![0].store_depots![0].id, values.property, values.value
                                    )

                                    if (response) {
                                        setUpdateNeeded(true)

                                        let newProperties = [...localPropertiesData!]
                                        newProperties.push(response)

                                        setLocalPropertiesData(newProperties)
                                        notifySuccess("Propiedad agregada")
                                    }
                                }}
                            >
                                {
                                    formik => (
                                        <Grid container item xs={12} rowSpacing={1}>
                                            <Grid container columnSpacing={1} item xs={12}>
                                                <Grid item xs={6}>
                                                    <TextField
                                                        label="Nombre"
                                                        size={"small"}
                                                        fullWidth
                                                        {...formik.getFieldProps("property")}
                                                        error={!!formik.errors.property && formik.touched.property}
                                                        helperText={(formik.errors.property && formik.touched.property) && formik.errors.property}
                                                    />
                                                </Grid>

                                                <Grid item xs={6}>
                                                    <TextField
                                                        label="Valor"
                                                        size={"small"}
                                                        fullWidth
                                                        {...formik.getFieldProps("value")}
                                                        error={!!formik.errors.value && formik.touched.value}
                                                        helperText={(formik.errors.value && formik.touched.value) && formik.errors.value}
                                                    />
                                                </Grid>
                                            </Grid>

                                            <Grid container item xs={12} justifyContent={"flex-end"}>
                                                <Button
                                                    color={"secondary"}
                                                    variant={"outlined"}
                                                    size={"small"}
                                                    onClick={() => setDisplayEditForm(false)}
                                                    sx={{mr: "5px"}}
                                                >
                                                    Cancelar
                                                </Button>

                                                <Button
                                                    color={"primary"}
                                                    variant={"outlined"}
                                                    size={"small"}
                                                    disabled={!formik.isValid}
                                                    onClick={() => formik.handleSubmit()}
                                                >
                                                    Agregar nuevo
                                                </Button>
                                            </Grid>
                                        </Grid>
                                    )
                                }
                            </Formik>
                        ) : (
                            <IconButton onClick={() => setDisplayEditForm(true)}>
                                <EditOutlined/>
                            </IconButton>
                        )
                }
            </Grid>
        </Grid>
    )

    return (
        <div>
            <GenericFullScreenModal
                dialogTitle={"Propiedades"}
                open={displayProperties}
                handleClose={handleCloseModal}
                fullScreen={displayEditForm}
            >
                {
                    !!localPropertiesData
                        ? <PropertiesList properties={localPropertiesData}/>
                        : <div>empty</div>
                }
            </GenericFullScreenModal>

            <IconButton onClick={() => setDisplayProperties(true)}>
                {
                    !!localPropertiesData
                        ? <DescriptionOutlined/>
                        : <AddOutlined/>
                }
            </IconButton>
        </div>
    )
}

export default StoreDepotPropertiesManage