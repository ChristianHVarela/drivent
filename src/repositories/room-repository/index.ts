import { prisma } from "@/config";


async function findById(id: number){
    return await prisma.room.findFirst({
        where: { id }
    });
}

export default { findById }