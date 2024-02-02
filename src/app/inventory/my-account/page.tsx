import { nextAuthOptions } from '@/app/api/auth/[...nextauth]/options';
import MyAccount from './components/MyAccount';
import { getServerSession } from 'next-auth';
import { prisma } from '@/db';
import React from 'react';

const MyAccountPage = async () => {
    const session = await getServerSession(nextAuthOptions);
    const user = await prisma.users.findUnique({ where: { id: session?.user.id } })
    return <MyAccount user={user} />
}

export default MyAccountPage