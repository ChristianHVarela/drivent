import { AuthenticatedRequest } from "@/middlewares";
import { NextFunction, Response } from "express";
import httpStatus from "http-status";
import bookingService, { MakeBooking } from "@/services/booking-service";

export async function getBooking(req: AuthenticatedRequest, res: Response, next: NextFunction){
    const { userId } = req;
    try {
        const booking = await bookingService.findBooking(userId);
        return res.status(httpStatus.OK).send(booking);
    } catch (error) {
        console.log(error);
        next(error);
    }
} 

export async function makeBooking(req: AuthenticatedRequest, res: Response, next: NextFunction){
    const { userId } = req;
    const makeBookingObj: MakeBooking = req.body;
    try {
        const bookingId = await bookingService.makeBooking(makeBookingObj, userId);
        return res.status(httpStatus.OK).send({bookingId});
    } catch (error) {
        next(error);
    }
}