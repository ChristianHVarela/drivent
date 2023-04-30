import { AuthenticatedRequest } from "@/middlewares";
import { Response } from "express";
import httpStatus from "http-status";
import bookingService from "@/services/booking-service";

export async function getBooking(req: AuthenticatedRequest, res: Response){
    const { userId } = req
    try {
        const booking = await bookingService.findBooking(userId);
        res.status(httpStatus.OK).send(booking);
    } catch (error) {
        res.status(httpStatus.NOT_FOUND).send();
    }
}