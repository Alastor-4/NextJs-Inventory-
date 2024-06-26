import { createUploadthing, type FileRouter } from "uploadthing/next";
import {getServerSession} from "next-auth/next"
import {nextAuthOptions} from "@/app/api/auth/[...nextauth]/options";

const f = createUploadthing();

// FileRouter for your app, can contain multiple FileRoutes
export const ourFileRouter = {
    // Define as many FileRoutes as you like, each with a unique routeSlug
    imageUploader: f({ image: { maxFileSize: "4MB", maxFileCount: 1 } })
        // Set permissions and file types for this  FileRoute
        // @ts-ignore
        .middleware(async ({ req }) => {
            // This code runs on your server before upload
            const session = await getServerSession(nextAuthOptions)
            const user = session?.user

            // If you throw, the user will not be able to upload
            if (!user || !user.role_id || ![1,2, 3].includes(user.role_id)) throw new Error("Unauthorized");

            // Whatever is returned here is accessible in onUploadComplete as `metadata`
            return true;
        })
        .onUploadComplete(async ({ metadata, file }) => {
            // This code RUNS ON YOUR SERVER after upload
            // console.log("Upload complete for userId:", metadata.userId);
            //
            // console.log("file url", file.url);
        }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;