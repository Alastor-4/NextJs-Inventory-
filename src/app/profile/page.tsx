import { getServerSession } from 'next-auth';
import { redirect } from "next/navigation";
import React from 'react'
import { nextAuthOptions } from '../api/auth/[...nextauth]/options';

const Profile = async () => {
    const session = await getServerSession(nextAuthOptions);
    // @ts-ignore
    if (session?.user?.id) {
        // @ts-ignore
        redirect(`/profile/${session.user?.id}`);
    }
    return (
        <div>page</div>
    )
}

export default Profile