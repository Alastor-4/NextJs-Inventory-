import { nextAuthOptions } from '@/app/api/auth/[...nextauth]/options';
import { userWithRole } from '@/types/interfaces';
import MyAccount from './components/MyAccount';
import { getServerSession } from 'next-auth';
import { prisma } from '@/db';
import React from 'react';

const MyAccountPage = async () => {
    const session = await getServerSession(nextAuthOptions);
    const user: userWithRole | null = await prisma.users.findUnique({ where: { id: session?.user.id }, include: { roles: true } });
    return <MyAccount user={user} />
}

export default MyAccountPage