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
import { BoardsService } from './boards.service';
import { CreateBoardDto } from './dto/create-board.dto';
import { UpdateBoardDto } from './dto/update-board.dto';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiBearerAuth } from '@nestjs/swagger';

@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('boards')
export class BoardsController {
  private readonly logger = new Logger(BoardsController.name);

  constructor(private readonly boardsService: BoardsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createBoardDto: CreateBoardDto) {
    this.logger.log(`Creating board in project: ${createBoardDto.projectId}`);
    return this.boardsService.create(createBoardDto);
  }

  @Get()
  async findAll(@Query('projectId') projectId?: string) {
    if (projectId) {
      this.logger.log(`Fetching boards for projectId: ${projectId}`);
      return this.boardsService.findAllByProjectId(projectId);
    }
    this.logger.log('Fetching all boards is not supported without projectId, returning empty');
    return [];
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    this.logger.log(`Fetching board with id: ${id}`);
    return this.boardsService.findById(id);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateBoardDto: UpdateBoardDto) {
    this.logger.log(`Updating board with id: ${id}`);
    return this.boardsService.update(id, updateBoardDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    this.logger.log(`Deleting board with id: ${id}`);
    await this.boardsService.remove(id);
  }
}
