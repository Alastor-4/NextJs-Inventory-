import {allProductsByDepartmentProps} from "@/types/interfaces";
import {AddOutlined, DescriptionOutlined} from "@mui/icons-material";
import {Grid, IconButton} from "@mui/material";
import {store_depot_characteristics} from "@prisma/client";


const StoreDepotCharacteristicsManage = ({data}: { data: allProductsByDepartmentProps }) => {

    const CharacteristicList = ({characteristics}: {characteristics: store_depot_characteristics[]}) => (
        <Grid container rowSpacing={1}>
            {
                characteristics.map(item => )
            }
        </Grid>
    )

    return (
        <div>
            <IconButton>
                {
                    data.products![0].depots![0].store_depots![0].store_depot_characteristics!.length > 0
                        ? <DescriptionOutlined/>
                        : <AddOutlined/>
                }
            </IconButton>
        </div>
    )
}