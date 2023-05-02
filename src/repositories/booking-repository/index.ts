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

async function findById(id: number){
    return await prisma.booking.findFirst({
        where: { id }
    });
}

async function deleteById(id: number){
    return await prisma.booking.delete({
        where: { id }
    });
}

export default {
    findByUserId, findByRoomId,
    createBooking, findById, deleteById
};

