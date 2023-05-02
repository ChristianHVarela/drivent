import { MakeBooking } from "@/services/booking-service";
import Joi from "joi";

export const makeBookingSchema = Joi.object<MakeBooking>({
    roomId: Joi.number().required()
})
