import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Param,
  Body,
  Request,
  UseGuards,
  NotFoundException,
} from '@nestjs/common';
import { EventsService } from './events.service';
import { Event } from './event.entity';
import { CreateEventDto } from './dto/create-event.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  async findAllUserEvents(@Request() req: any): Promise<Event[]> {
    return this.eventsService.findAllByUserId(req.user.id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  async createEvent(
    @Body() createEventDto: CreateEventDto,
    @Request() req: any,
  ): Promise<Event> {
    return this.eventsService.create(createEventDto, req.user.id);
  }

  @Get(':eventId')
  async findEventById(@Param('eventId') eventId: number): Promise<Event> {
    const event = await this.eventsService.findOne(eventId);
    if (!event) {
      throw new NotFoundException('Event not found');
    }
    return event;
  }

  @Put(':eventId')
  @UseGuards(JwtAuthGuard)
  async updateEvent(
    @Param('eventId') eventId: number,
    @Body() updateEventDto: CreateEventDto,
  ): Promise<Event> {
    return this.eventsService.update(eventId, updateEventDto);
  }

  @Delete(':eventId')
  @UseGuards(JwtAuthGuard)
  async removeEvent(@Param('eventId') eventId: number): Promise<void> {
    await this.eventsService.remove(eventId);
  }
}
