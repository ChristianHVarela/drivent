import { makeBooking } from "@/controllers/booking-controller";
import { authenticateToken, validateBody } from "@/middlewares";
import { makeBookingSchema } from "@/schemas/booking-schemas";
import { Router } from "express";

const bookingRouter = Router();

bookingRouter
    .all('/*', authenticateToken)
    .get('/')
    .post('/', validateBody(makeBookingSchema), makeBooking);

export { bookingRouter }