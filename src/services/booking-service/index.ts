import { notFoundError } from "@/errors";
import bookingRepository from "@/repositories/booking-repository";
import { Booking, Room } from "@prisma/client";

async function findBooking(userId: number): Promise<FindBooking> {
    const booking = await bookingRepository.findByUserId(userId);
    if (!booking){
        throw notFoundError();
    }
    return { id: booking.id, Room: booking.Room }
}

type FindBooking = {
    id: number;
    Room: Room;
}

const bookingService = {
    findBooking
};

export default bookingService;