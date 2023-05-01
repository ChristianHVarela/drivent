import { ApplicationError } from "@/protocols";


export function unableValidTicket(): ApplicationError {
    return {
        name: 'UnableValidTicket',
        message: 'Unable to identify a valid ticket'
    }
}