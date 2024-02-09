import {productsProps} from "@/types/interfaces";
import {AddOutlined, DeleteOutline, DescriptionOutlined, EditOutlined} from "@mui/icons-material";
import {Button, Checkbox, Grid, IconButton, TextField, Typography} from "@mui/material";
import {store_depot_properties} from "@prisma/client";
import React from "react";
import GenericFullScreenModal from "@/app/inventory/components/GenericFullScreenModal";
import {useFormik} from "formik";
import * as Yup from "yup"
import {CharacteristicInfoTag} from "@/components/InfoTags";
import sellerStoreProduct from "@/app/inventory/seller/store/[sellerStoreId]/product/requests/sellerStoreProduct";


const StoreDepotPropertiesManage = ({data}: { data: productsProps }) => {
    const [displayProperties, setDisplayProperties] = React.useState(false)
    const [displayEditForm, setDisplayEditForm] = React.useState(false)

    const formik = useFormik({
        initialValues: {
            property: "",
            value: "",
        },
        validationSchema: Yup.object({
            property: Yup.string().required("valor requerido"),
            value: Yup.string().required("valor requerido"),
        }),
        onSubmit: values => {
            console.log(values)
        }
    })

    const handleToggleActive = async (propertyItem: store_depot_properties) => {
        const isActive = !propertyItem.is_active
        const response = await sellerStoreProduct.toggleActiveStoreDepotProperty(data.depots![0].store_depots![0].id, propertyItem.id, isActive)
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
                                        <>
                                            <IconButton size={"small"}>
                                                <EditOutlined/>
                                            </IconButton>

                                            <IconButton size={"small"}>
                                                <DeleteOutline/>
                                            </IconButton>
                                        </>
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
                            <Grid container item xs={12} rowSpacing={1}>
                                <Grid item xs={12}>
                                    <Grid item xs={6}>
                                        <TextField
                                            label="property"
                                            size={"small"}
                                            fullWidth
                                            {...formik.getFieldProps("property")}
                                            error={!!formik.errors.property && formik.touched.property}
                                            helperText={(formik.errors.property && formik.touched.property) && formik.errors.property}
                                        />
                                    </Grid>

                                    <Grid item xs={6}>
                                        <TextField
                                            label="value"
                                            size={"small"}
                                            fullWidth
                                            {...formik.getFieldProps("value")}
                                            error={!!formik.errors.value && formik.touched.value}
                                            helperText={(formik.errors.value && formik.touched.value) && formik.errors.value}
                                        />
                                    </Grid>
                                </Grid>
                                <Grid container item xs={12} justifyContent={"flex-end"}>
                                    <Button color={"secondary"} variant={"outlined"} size={"small"} onClick={() => setDisplayEditForm(false)}>
                                        Cancelar
                                    </Button>

                                    <Button color={"primary"} variant={"outlined"} size={"small"}>
                                        Agregar nuevo
                                    </Button>
                                </Grid>
                            </Grid>
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
                setOpen={setDisplayProperties}
                fullScreen={displayEditForm}
            >
                {
                    !!data.depots![0].store_depots![0].store_depot_properties
                        ? <PropertiesList properties={data.depots![0].store_depots![0].store_depot_properties}/>
                        : <div>empty</div>
                }
            </GenericFullScreenModal>

            <IconButton onClick={() => setDisplayProperties(true)}>
                {
                    data.depots![0].store_depots![0].store_depot_properties!.length > 0
                        ? <DescriptionOutlined/>
                        : <AddOutlined/>
                }
            </IconButton>
        </div>
    )
}

export default StoreDepotPropertiesManage