import { Test, TestingModule } from '@nestjs/testing';
import { EventsController } from './events.controller';
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { Event } from './event.entity';
import { NotFoundException } from '@nestjs/common';

describe('EventsController', () => {
  let controller: EventsController;
  let eventsService: EventsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EventsController],
      providers: [EventsService],
    })
      .overrideProvider(EventsService)
      .useValue(mockEventsService)
      .compile();

    controller = module.get<EventsController>(EventsController);
    eventsService = module.get<EventsService>(EventsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createEvent', () => {
    it('should create a event', async () => {
      const createEventDto: CreateEventDto = {
        title: 'Test Event',
        content: 'This is a test event',
      };
      const userId = 1;
      const event: Event = new Event();
      event.title = createEventDto.title;
      event.content = createEventDto.content;
      event.userId = userId;

      jest.spyOn(eventsService, 'create').mockResolvedValue(event);

      const mockRequest = { user: { id: userId } };

      const result = await controller.createEvent(createEventDto, mockRequest);
      expect(result).toBe(event);
    });
  });

  describe('findEventById', () => {
    it('should find a event by ID', async () => {
      const eventId = 1;
      const event: Event = new Event();
      event.eventId = eventId;
      event.title = 'Test Event';
      event.content = 'This is a test event';

      jest.spyOn(eventsService, 'findOne').mockResolvedValue(event);

      const result = await controller.findEventById(eventId);
      expect(result).toBe(event);
    });

    it('should handle event not found by ID', async () => {
      const eventId = 1;
      jest
        .spyOn(eventsService, 'findOne')
        .mockRejectedValue(new NotFoundException());

      try {
        await controller.findEventById(eventId);
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
      }
    });
  });

  const mockEventsService = {
    create: jest.fn(),
    findOne: jest.fn(),
  };
});
