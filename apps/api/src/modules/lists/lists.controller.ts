import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpCode,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { ListsService } from './lists.service';
import { CreateListDto } from './dto/create-list.dto';
import { UpdateListDto } from './dto/update-list.dto';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiBearerAuth } from '@nestjs/swagger';

@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('lists')
export class ListsController {
  private readonly logger = new Logger(ListsController.name);

  constructor(private readonly listsService: ListsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createListDto: CreateListDto) {
    this.logger.log(`Creating list in board: ${createListDto.boardId}`);
    return this.listsService.create(createListDto);
  }

  @Get()
  async findAll(@Query('boardId') boardId?: string) {
    if (boardId) {
      this.logger.log(`Fetching lists for boardId: ${boardId}`);
      return this.listsService.findAllByBoardId(boardId);
    }
    this.logger.log('Fetching all lists is not supported without boardId, returning empty');
    return [];
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    this.logger.log(`Fetching list with id: ${id}`);
    return this.listsService.findById(id);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateListDto: UpdateListDto) {
    this.logger.log(`Updating list with id: ${id}`);
    return this.listsService.update(id, updateListDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    this.logger.log(`Deleting list with id: ${id}`);
    await this.listsService.remove(id);
  }
}
