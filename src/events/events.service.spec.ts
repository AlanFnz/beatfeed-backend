import { Test, TestingModule } from '@nestjs/testing';
import { EventsService } from './events.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Event } from './event.entity';
import { CreateEventDto } from './dto/create-event.dto';
import { NotFoundException } from '@nestjs/common';

describe('EventsService', () => {
  let service: EventsService;
  let eventsRepository: Repository<Event>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EventsService,
        {
          provide: getRepositoryToken(Event),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            findOne: jest.fn(),
            preload: jest.fn(),
            delete: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<EventsService>(EventsService);
    eventsRepository = module.get<Repository<Event>>(getRepositoryToken(Event));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should successfully create a event', async () => {
      const createEventDto: CreateEventDto = {
        title: 'Test Event',
        content: 'This is a test event content',
      };
      const userId = 1; // Example user ID
      const expectedEvent = new Event();
      expectedEvent.title = createEventDto.title;
      expectedEvent.content = createEventDto.content;
      expectedEvent.userId = userId;

      jest.spyOn(eventsRepository, 'create').mockReturnValue(expectedEvent);
      jest.spyOn(eventsRepository, 'save').mockResolvedValue(expectedEvent);

      const result = await service.create(createEventDto, userId);
      expect(result).toEqual(expectedEvent);
      expect(eventsRepository.create).toHaveBeenCalledWith({
        ...createEventDto,
        user_id: userId,
        created_at: expect.any(Date),
        updated_at: expect.any(Date),
      });
      expect(eventsRepository.save).toHaveBeenCalledWith(expectedEvent);
    });
  });

  describe('findOne', () => {
    it('should return a event when found', async () => {
      const eventId = 1;
      const expectedEvent = new Event();
      expectedEvent.eventId = eventId;
      expectedEvent.title = 'Found Event';
      expectedEvent.content = 'Content of the found event';

      jest.spyOn(eventsRepository, 'findOne').mockResolvedValue(expectedEvent);

      const result = await service.findOne(eventId);
      expect(result).toEqual(expectedEvent);
      expect(eventsRepository.findOne).toHaveBeenCalledWith({
        where: { event_id: eventId },
      });
    });

    it('should throw NotFoundException when a event is not found', async () => {
      const eventId = 1;
      jest.spyOn(eventsRepository, 'findOne').mockResolvedValue(undefined);

      await expect(service.findOne(eventId)).rejects.toThrow(NotFoundException);
    });
  });
});
