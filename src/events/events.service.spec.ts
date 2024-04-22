import { Test, TestingModule } from '@nestjs/testing';
import { EventsService } from './events.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DeleteResult, Repository } from 'typeorm';
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
            find: jest.fn(),
            findOne: jest.fn(),
            findOneBy: jest.fn(),
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
    it('should successfully create an event', async () => {
      const createEventDto: CreateEventDto = {
        title: 'Test Event',
        description: 'This is a test event description',
        location: 'Test Location',
        coverImage: 'Test Image URL',
      };
      const userId = 1;
      const expectedEvent = new Event();
      expectedEvent.title = createEventDto.title;
      expectedEvent.description = createEventDto.description;
      expectedEvent.location = createEventDto.location;
      expectedEvent.coverImage = createEventDto.coverImage;
      expectedEvent.userId = userId;
      expectedEvent.goingCount = 0;
      expectedEvent.likesCount = 0;
      expectedEvent.commentsCount = 0;
      expectedEvent.createdAt = new Date(); // mock current date or a fixed date as needed
      expectedEvent.updatedAt = new Date();

      jest.spyOn(eventsRepository, 'create').mockReturnValue(expectedEvent);
      jest.spyOn(eventsRepository, 'save').mockResolvedValue(expectedEvent);

      const result = await service.create(createEventDto, userId);
      expect(result).toEqual(expectedEvent);
      expect(eventsRepository.create).toHaveBeenCalledWith({
        ...createEventDto,
        userId,
        goingCount: 0,
        likesCount: 0,
        commentsCount: 0,
      });
      expect(eventsRepository.save).toHaveBeenCalledWith(expectedEvent);
    });
  });

  describe('findOne', () => {
    it('should return an event when found', async () => {
      const eventId = 1;
      const expectedEvent = new Event();
      expectedEvent.eventId = eventId;
      expectedEvent.title = 'Found Event';
      expectedEvent.description = 'Content of the found event';

      jest.spyOn(eventsRepository, 'findOne').mockResolvedValue(expectedEvent);

      const result = await service.findOne(eventId);
      expect(result).toEqual(expectedEvent);
      expect(eventsRepository.findOne).toHaveBeenCalledWith({
        where: { eventId },
      });
    });

    it('should throw NotFoundException when an event is not found', async () => {
      const eventId = 1;
      jest.spyOn(eventsRepository, 'findOne').mockResolvedValue(undefined);

      await expect(service.findOne(eventId)).rejects.toThrow(NotFoundException);
    });
  });

  describe('findAllByUserId', () => {
    it('should return an array of events for the specified user', async () => {
      const userId = 1;
      const events = [new Event(), new Event()];
      jest.spyOn(eventsRepository, 'find').mockResolvedValue(events);

      const result = await service.findAllByUserId(userId);
      expect(result).toEqual(events);
      expect(eventsRepository.find).toHaveBeenCalledWith({
        where: { userId },
      });
    });
  });

  describe('update', () => {
    it('should update an event successfully', async () => {
      const eventId = 1;
      const updateEventDto: CreateEventDto = {
        title: 'Updated Event',
        description: 'Updated description',
        location: 'Updated Location',
        coverImage: 'Updated Image URL',
      };
      const existingEvent = new Event();
      existingEvent.eventId = eventId;
      existingEvent.title = 'Original Event';
      existingEvent.description = 'Original description';
      existingEvent.userId = 1;

      jest
        .spyOn(eventsRepository, 'findOneBy')
        .mockResolvedValue(existingEvent);
      jest.spyOn(eventsRepository, 'save').mockImplementation(async (event) => {
        Object.assign(existingEvent, event);
        return existingEvent;
      });

      const result = await service.update(eventId, updateEventDto);
      expect(result.title).toEqual(updateEventDto.title);
      expect(result.description).toEqual(updateEventDto.description);
      expect(eventsRepository.save).toHaveBeenCalled();
      expect(eventsRepository.findOneBy).toHaveBeenCalledWith({ eventId });
    });

    it('should throw NotFoundException when event to update is not found', async () => {
      const eventId = 99; // non existent event id
      jest.spyOn(eventsRepository, 'findOneBy').mockResolvedValue(undefined);

      await expect(
        service.update(eventId, {} as CreateEventDto),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should remove an event successfully', async () => {
      const eventId = 1;
      const mockDeleteResult: DeleteResult = {
        affected: 1,
        raw: [],
      };
      jest
        .spyOn(eventsRepository, 'delete')
        .mockResolvedValue(mockDeleteResult);

      await expect(service.remove(eventId)).resolves.not.toThrow();
    });

    it('should throw NotFoundException when event to remove is not found', async () => {
      const eventId = 99; // Non-existing event ID
      const mockDeleteResult: DeleteResult = {
        affected: 0,
        raw: [],
      };
      jest
        .spyOn(eventsRepository, 'delete')
        .mockResolvedValue(mockDeleteResult);

      await expect(service.remove(eventId)).rejects.toThrow(NotFoundException);
    });
  });
});
