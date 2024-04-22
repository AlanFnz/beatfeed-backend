import { Test, TestingModule } from '@nestjs/testing';
import { EventsController } from './events.controller';
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { Event } from './event.entity';
import { NotFoundException } from '@nestjs/common';

describe('EventsController', () => {
  let controller: EventsController;
  let service: EventsService;

  const mockEventsService = {
    create: jest.fn(),
    findAllByUserId: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EventsController],
      providers: [
        {
          provide: EventsService,
          useValue: mockEventsService,
        },
      ],
    }).compile();

    controller = module.get<EventsController>(EventsController);
    service = module.get<EventsService>(EventsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAllUserEvents', () => {
    it('should return an array of events', async () => {
      const userId = 1;
      const events: Event[] = [new Event(), new Event()];
      jest.spyOn(service, 'findAllByUserId').mockResolvedValue(events);

      const result = await controller.findAllUserEvents({
        user: { id: userId },
      });
      expect(result).toEqual(events);
      expect(service.findAllByUserId).toHaveBeenCalledWith(userId);
    });
  });

  describe('createEvent', () => {
    it('should create an event', async () => {
      const createEventDto: CreateEventDto = {
        title: 'Test Event',
        description: 'This is a test event description',
        location: 'Test Location',
        coverImage: 'Test Image URL',
      };
      const userId = 1;
      const event: Event = {
        ...createEventDto,
        userId,
        eventId: 1,
        goingCount: 0,
        likesCount: 0,
        commentsCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as Event;

      jest.spyOn(service, 'create').mockResolvedValue(event);

      const mockRequest = { user: { id: userId } };
      const result = await controller.createEvent(createEventDto, mockRequest);
      expect(result).toEqual(event);
      expect(service.create).toHaveBeenCalledWith(createEventDto, userId);
    });
  });

  describe('findEventById', () => {
    it('should return an event by ID', async () => {
      const eventId = 1;
      const event = new Event();
      event.eventId = eventId;
      event.title = 'Test Event';
      event.description = 'This is a test event';

      jest.spyOn(service, 'findOne').mockResolvedValue(event);

      const result = await controller.findEventById(eventId);
      expect(result).toEqual(event);
    });

    it('should throw NotFoundException if the event is not found', async () => {
      const eventId = 999;
      jest.spyOn(service, 'findOne').mockImplementation(() => {
        throw new NotFoundException('Event not found');
      });

      await expect(controller.findEventById(eventId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('updateEvent', () => {
    it('should update an event', async () => {
      const eventId = 1;
      const updateEventDto: CreateEventDto = {
        title: 'Updated Event',
        description: 'Updated description',
        location: 'Updated Location',
        coverImage: 'Updated Image URL',
      };
      const updatedEvent = {
        ...updateEventDto,
        eventId,
        userId: 1,
        goingCount: 0,
        likesCount: 0,
        commentsCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as Event;

      jest.spyOn(service, 'update').mockResolvedValue(updatedEvent);

      const result = await controller.updateEvent(eventId, updateEventDto);
      expect(result).toEqual(updatedEvent);
      expect(service.update).toHaveBeenCalledWith(eventId, updateEventDto);
    });
  });

  describe('removeEvent', () => {
    it('should remove an event', async () => {
      const eventId = 1;
      jest.spyOn(service, 'remove').mockResolvedValue();

      await expect(controller.removeEvent(eventId)).resolves.not.toThrow();
      expect(service.remove).toHaveBeenCalledWith(eventId);
    });
  });
});
