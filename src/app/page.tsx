import Link from "next/link"
import Login from "@/components/Login";
import {Grid} from "@mui/material";

export default function Home() {
    return (
        <main>
            <Grid container>
                <Login/>
            </Grid>
        </main>
    )
}
