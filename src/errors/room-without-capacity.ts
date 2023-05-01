import { ApplicationError } from "@/protocols";

export function roomWithoutCapacity(): ApplicationError {
    return {
        name: 'RoomWithoutCapacity',
        message: 'Room whithout capacity.'
    }
}