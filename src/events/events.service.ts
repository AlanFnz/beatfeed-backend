import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Event } from './event.entity';
import { CreateEventDto } from './dto/create-event.dto';

@Injectable()
export class EventsService {
  constructor(
    @InjectRepository(Event)
    private eventsRepository: Repository<Event>,
  ) {}

  async create(createEventDto: CreateEventDto, userId: number): Promise<Event> {
    const event = this.eventsRepository.create({
      ...createEventDto,
      userId,
      goingCount: 0,
      likesCount: 0,
      commentsCount: 0,
    });

    return this.eventsRepository.save(event);
  }

  async findAllByUserId(userId: number): Promise<Event[]> {
    return this.eventsRepository.find({
      where: { userId },
    });
  }

  async findOne(eventId: number): Promise<Event> {
    const event = await this.eventsRepository.findOne({
      where: { eventId },
    });

    if (!event) {
      throw new NotFoundException(`Event with ID ${eventId} not found`);
    }

    return event;
  }

  async update(
    eventId: number,
    updateEventDto: CreateEventDto,
  ): Promise<Event> {
    const event = await this.eventsRepository.findOneBy({ eventId });

    if (!event) {
      throw new NotFoundException(`Event with ID ${eventId} not found`);
    }

    Object.assign(event, updateEventDto);
    event.updatedAt = new Date();

    return this.eventsRepository.save(event);
  }

  async remove(eventId: number): Promise<void> {
    const result = await this.eventsRepository.delete(eventId);
    if (result.affected === 0) {
      throw new NotFoundException(`Event with ID ${eventId} not found`);
    }
  }
}
