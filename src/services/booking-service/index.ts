import { notFoundError } from "@/errors";
import { roomWithoutCapacity } from "@/errors/room-without-capacity";
import { unableValidTicket } from "@/errors/unable-valid-ticket";
import { userHasNoBooking } from "@/errors/user-has-no-booking";
import bookingRepository from "@/repositories/booking-repository";
import enrollmentRepository from "@/repositories/enrollment-repository";
import roomRepository from "@/repositories/room-repository";
import ticketsRepository from "@/repositories/tickets-repository";
import { Booking, Room } from "@prisma/client";

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
    if ((bookingWithRoom && bookingWithRoom.length >= room.capacity) || room.capacity === 0) throw roomWithoutCapacity();
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

async function tradeBooking(userId: number, bookingId: number, makeObj: MakeBooking): Promise<Number> {
    await validTradeBooking(userId);
    const room = await roomRepository.findById(makeObj.roomId);
    if (!room) throw notFoundError();
    const bookingWithRoom = await bookingRepository.findByRoomId(makeObj.roomId);
    if ((bookingWithRoom && bookingWithRoom.length >= room.capacity) || room.capacity === 0) throw roomWithoutCapacity();
    await bookingRepository.deleteById(bookingId);
    const booking = await bookingRepository.createBooking(userId, makeObj.roomId);
    return booking.id;
}

async function validTradeBooking(userId: number){
    const booking = await bookingRepository.findByUserId(userId);
    if (!booking) throw userHasNoBooking();

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
    makeBooking,
    tradeBooking
};

export default bookingService;