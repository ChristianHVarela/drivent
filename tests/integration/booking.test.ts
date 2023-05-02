import app, { init } from "@/app";
import { cleanDb, generateValidToken } from "../helpers";
import supertest from "supertest";
import faker from "@faker-js/faker";
import httpStatus from "http-status";
import { createEnrollmentWithAddress, createHotel, createPayment, createRoomWithHotelId, createRoomWithHotelIdAndOneCapacity, createRoomWithHotelIdAndWithoutCapacity, createTicket, createTicketType, createTicketTypeRemote, createTicketTypeWithHotel, createTicketTypeWithoutHotel, createUser } from "../factories";
import * as jwt from 'jsonwebtoken';
import { TicketStatus } from "@prisma/client";
import { createBooking } from "../factories/booking-factory";

beforeAll(async () => {
    await init();
});

beforeEach(async () => {
    await cleanDb();
});

const api = supertest(app);

describe('GET /booking', () => {
    it('should respond with status 401 if no token is given', async () => {
        const response = await api.get('/booking');

        expect(response.status).toBe(httpStatus.UNAUTHORIZED);
    });

    it('should respond with status 401 if given token is not valid', async () => {
        const token = faker.lorem.word();

        const response = await api.get('/booking').set('Authorization', `Bearer ${token}`);

        expect(response.status).toBe(httpStatus.UNAUTHORIZED);
    });

    it('should respond with status 401 if there is no session for given token', async () => {
        const userWithoutSession = await createUser();
        const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);

        const response = await api.get('/booking').set('Authorization', `Bearer ${token}`);

        expect(response.status).toBe(httpStatus.UNAUTHORIZED);
    });

    describe('when token is valid', () => {

        it('Should respond with a status code of 404 if the user doesnt have a booking', async () => {
            const user = await createUser();
            const token = await generateValidToken(user);
            const response = await api.get('/booking').set('Authorization', `Bearer ${token}`);

            expect(response.status).toBe(httpStatus.NOT_FOUND);
        })

        it('Should respond with a status code of 200 and list a booking', async () => {
            const user = await createUser();
            const token = await generateValidToken(user);
            const enrollment = await createEnrollmentWithAddress(user);
            const ticketType = await createTicketTypeWithHotel();
            const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
            const payment = await createPayment(ticket.id, ticketType.price);
            const hotel = await createHotel();
            const room = await createRoomWithHotelId(hotel.id);
            const booking = await createBooking(room.id, user.id);

            const response = await api.get('/booking').set('Authorization', `Bearer ${token}`);
            expect(response.status).toBe(httpStatus.OK);
        })
    })
})

describe('POST /booking', () => {
    it('should respond with status 401 if no token is given', async () => {
        const response = await api.post('/booking');

        expect(response.status).toBe(httpStatus.UNAUTHORIZED);
    });

    it('should respond with status 401 if given token is not valid', async () => {
        const token = faker.lorem.word();

        const response = await api.post('/booking').set('Authorization', `Bearer ${token}`);

        expect(response.status).toBe(httpStatus.UNAUTHORIZED);
    });

    it('should respond with status 401 if there is no session for given token', async () => {
        const userWithoutSession = await createUser();
        const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);

        const response = await api.post('/booking').set('Authorization', `Bearer ${token}`);

        expect(response.status).toBe(httpStatus.UNAUTHORIZED);
    });

    describe('when token is valid', () => {

        it('should respond with status 404 if you do not have that users enrollment', async () => {
            const user = await createUser();
            const token = await generateValidToken(user);
            const response = await api.post('/booking').set('Authorization', `Bearer ${token}`).send({ roomId: 1 });

            expect(response.status).toBe(httpStatus.NOT_FOUND);
        })

        it ('should respond with status 403 if the user does not have a ticket', async () => {
            const user = await createUser();
            const token = await generateValidToken(user);
            const enrollment = await createEnrollmentWithAddress(user);
            const response = await api.post('/booking').set('Authorization', `Bearer ${token}`).send({ roomId: 1 });

            expect(response.status).toBe(httpStatus.FORBIDDEN);
        })

        it ('should respond with status 403 if user has ticket but not paid', async () => {
            const user = await createUser();
            const token = await generateValidToken(user);
            const enrollment = await createEnrollmentWithAddress(user);
            const ticketType = await createTicketType();
            const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.RESERVED);
            const response = await api.post('/booking').set('Authorization', `Bearer ${token}`).send({ roomId: 1 });

            expect(response.status).toBe(httpStatus.FORBIDDEN);
        })

        it ('should respond with status 403 if user has ticket but it only works remotely', async () => {
            const user = await createUser();
            const token = await generateValidToken(user);
            const enrollment = await createEnrollmentWithAddress(user);
            const ticketType = await createTicketTypeRemote();
            const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
            const response = await api.post('/booking').set('Authorization', `Bearer ${token}`).send({ roomId: 1 });

            expect(response.status).toBe(httpStatus.FORBIDDEN);
        })

        it ('should respond with status 403 if the user has the ticket but it does not have hotel included', async () => {
            const user = await createUser();
            const token = await generateValidToken(user);
            const enrollment = await createEnrollmentWithAddress(user);
            const ticketType = await createTicketTypeWithoutHotel();
            const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
            const response = await api.post('/booking').set('Authorization', `Bearer ${token}`).send({ roomId: 1 });

            expect(response.status).toBe(httpStatus.FORBIDDEN);
        })

        it ('should respond with status 404 if room does not exist', async () => {
            const user = await createUser();
            const token = await generateValidToken(user);
            const enrollment = await createEnrollmentWithAddress(user);
            const ticketType = await createTicketTypeWithHotel();
            const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
            const response = await api.post('/booking').set('Authorization', `Bearer ${token}`).send({ roomId: 1 });

            expect(response.status).toBe(httpStatus.NOT_FOUND);
        })

        it ('should respond with status 200 and return the bookingId', async () => {
            const user = await createUser();
            const token = await generateValidToken(user);
            const enrollment = await createEnrollmentWithAddress(user);
            const ticketType = await createTicketTypeWithHotel();
            const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
            const hotel = await createHotel();
            const room = await createRoomWithHotelIdAndOneCapacity(hotel.id);
            const response = await api.post('/booking').set('Authorization', `Bearer ${token}`).send({ roomId: 200 });

            expect(response.status).toBe(httpStatus.OK);
        })        
    })
});

describe('PUT /booking', () => {
    it('should respond with status 401 if no token is given', async () => {
        const response = await api.put('/booking/1');

        expect(response.status).toBe(httpStatus.UNAUTHORIZED);
    });

    it('should respond with status 401 if given token is not valid', async () => {
        const token = faker.lorem.word();

        const response = await api.put('/booking/1').set('Authorization', `Bearer ${token}`);

        expect(response.status).toBe(httpStatus.UNAUTHORIZED);
    });

    it('should respond with status 401 if there is no session for given token', async () => {
        const userWithoutSession = await createUser();
        const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);

        const response = await api.put('/booking/1').set('Authorization', `Bearer ${token}`);

        expect(response.status).toBe(httpStatus.UNAUTHORIZED);
    });

    describe('when token is valid', () => {

        it ('should respond with status 403 if the user has no booking', async () => {
            const user = await createUser();
            const token = await generateValidToken(user);
            const response = await api.put('/booking/1').set('Authorization', `Bearer ${token}`).send({ roomId: 1 });
            expect(response.status).toBe(httpStatus.FORBIDDEN);
        })

        it ('should respond with status 403 if the room has no capacity', async () => {
            const user = await createUser();
            const token = await generateValidToken(user);
            const enrollment = await createEnrollmentWithAddress(user);
            const ticketType = await createTicketTypeWithHotel();
            const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
            const hotel = await createHotel();
            const room = await createRoomWithHotelIdAndWithoutCapacity(hotel.id);
            const response = await api.put('/booking/1').set('Authorization', `Bearer ${token}`).send({ roomId: 200 });
            expect(response.status).toBe(httpStatus.FORBIDDEN);
        })

    });
});