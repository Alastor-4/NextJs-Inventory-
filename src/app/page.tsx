import Link from "next/link"
import Login from "@/components/Login";
import {Grid} from "@mui/material";

export default function Home() {
    return (
        <main>
            <Grid container>
                <Grid item xs={12}>
                    <Login/>
                </Grid>

                <Grid container item xs={12}>
                    <Grid item xs={3}>
                        <Link href={"/role"}>
                            Roles{' -->>'}
                        </Link>
                    </Grid>

                    <Grid item xs={3}>
                        <Link href={"/user"}>
                            Users{' -->>'}
                        </Link>
                    </Grid>

                    <Grid item xs={3}>
                        <Link href={"/warehouse"}>
                            Warehouses{' -->>'}
                        </Link>
                    </Grid>

                    <Grid item xs={3}>
                        <a
                            href="https://vercel.com/new?utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <h2>
                                Deploy{' -->>'}
                            </h2>
                            <p>
                                Instantly deploy your Next.js site.
                            </p>
                        </a>
                    </Grid>
                </Grid>
            </Grid>
        </main>
    )
}
