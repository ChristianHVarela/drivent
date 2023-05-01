import { prisma } from "@/config";


async function findByUserId(userId: number){
    return await prisma.booking.findFirst({
        where: { userId },
        include: { Room: true }
    })
}

async function findByRoomId(roomId: number){
    return await prisma.booking.findMany({
        where: { roomId }
    })
}

async function createBooking(userId: number, roomId: number){
    return await prisma.booking.create({
        data: { roomId, userId }
    })
}

export default {
    findByUserId,
    findByRoomId,
    createBooking
};

