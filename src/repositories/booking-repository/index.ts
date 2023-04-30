import { prisma } from "@/config";


async function findByUserId(userId: number){
    return await prisma.booking.findFirst({
        where: { userId },
        include: { Room: true }
    })
}


const bookingRepository = {
    findByUserId
};

export default bookingRepository;

