import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  NotFoundException,
  InternalServerErrorException,
  Request,
  UseGuards,
} from '@nestjs/common';
import { EventsService } from './events.service';
import { Event } from './event.entity';
import { CreateEventDto } from './dto/create-event.dto';
import { ErrorResponse } from 'src/types';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  async findAllUserEvents(
    @Request() req: any,
  ): Promise<Event[] | ErrorResponse> {
    try {
      const userId = req.user.id;
      return await this.eventsService.findAllByUserId(userId);
    } catch (error) {
      throw new InternalServerErrorException('Internal server error');
    }
  }

  @Post()
  async createEvent(
    @Body() createEventDto: CreateEventDto,
    @Request() req: any,
  ): Promise<Event | ErrorResponse> {
    try {
      const userId = req.user.id;
      return await this.eventsService.create(createEventDto, userId);
    } catch (error) {
      throw new InternalServerErrorException('Internal server error');
    }
  }

  @Get(':eventId')
  async findEventById(
    @Param('eventId') eventId: number,
  ): Promise<Event | ErrorResponse> {
    try {
      const event = await this.eventsService.findOne(eventId);
      if (!event) {
        throw new NotFoundException('Event not found');
      }
      return event;
    } catch (error) {
      if (error instanceof NotFoundException) {
        return { message: 'Event not found', statusCode: 404 };
      } else {
        throw new InternalServerErrorException('Internal server error');
      }
    }
  }
}
