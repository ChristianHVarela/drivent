import { notFoundError } from "@/errors";
import { roomWithoutCapacity } from "@/errors/room-without-capacity";
import { unableValidTicket } from "@/errors/unable-valid-ticket";
import bookingRepository from "@/repositories/booking-repository";
import enrollmentRepository from "@/repositories/enrollment-repository";
import roomRepository from "@/repositories/room-repository";
import ticketsRepository from "@/repositories/tickets-repository";
import { Room } from "@prisma/client";

async function findBooking(userId: number): Promise<FindBooking> {
    const booking = await bookingRepository.findByUserId(userId);
    if (!booking) {
        throw notFoundError();
    }
    return { id: booking.id, Room: booking.Room }
}

async function makeBooking(makeObj: MakeBooking, userId: number): Promise<Number> {
    await checkBusinessRules(userId);
    const room = await roomRepository.findById(makeObj.roomId);
    if (!room) throw notFoundError();
    const bookingWithRoom = await bookingRepository.findByRoomId(makeObj.roomId);
    if (bookingWithRoom && bookingWithRoom.length >= room.capacity) throw roomWithoutCapacity();
    const booking = await bookingRepository.createBooking(userId, makeObj.roomId);
    return booking.id;
}

async function checkBusinessRules(userId: number) {
    const enrollment = await enrollmentRepository.findWithAddressByUserId(userId);
    if (!enrollment) throw notFoundError();
    const ticket = await ticketsRepository.findTicketByEnrollmentId(enrollment.id);

    if (!ticket || ticket.status === 'RESERVED' || ticket.TicketType.isRemote || !ticket.TicketType.includesHotel) {
        throw unableValidTicket();
    }
}

type FindBooking = {
    id: number;
    Room: Room;
}

export type MakeBooking = {
    roomId: number;
}

const bookingService = {
    findBooking,
    makeBooking
};

export default bookingService;