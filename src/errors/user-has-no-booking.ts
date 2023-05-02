import { ApplicationError } from "@/protocols";


export function userHasNoBooking(): ApplicationError {
    return {
        name: 'UserHasNoBooking',
        message: 'User has no booking in the name.'
    }
}