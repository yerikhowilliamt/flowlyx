import { BoardResponse, BoardSummary } from '../../models/board.model';
import { Serialize } from '../../common/interceptors/serialize.interceptor';
import { PaginationDto } from '../../core/pagination';
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
import {
  ApiTags,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';

@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@ApiTags('Boards')
@Controller('boards')
export class BoardsController {
  private readonly logger = new Logger(BoardsController.name);

  constructor(private readonly boardsService: BoardsService) {}
  @ApiOperation({ summary: 'Create a new board' })
  @ApiCreatedResponse({ type: BoardResponse })
  @Serialize(BoardResponse)
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createBoardDto: CreateBoardDto) {
    this.logger.log(`Creating board in project: ${createBoardDto.projectId}`);
    return this.boardsService.create(createBoardDto);
  }
  @ApiOperation({ summary: 'List all boards' })
  @ApiOkResponse({ type: [BoardSummary] })
  @Serialize([BoardSummary])
  @Get()
  async findAll(@Query() query: PaginationDto, @Query('projectId') projectId?: string) {
    if (projectId) {
      this.logger.log(`Fetching boards for projectId: ${projectId}`);
      return this.boardsService.findAllByProjectId(projectId, query);
    }
    this.logger.log('Fetching all boards is not supported without projectId, returning empty');
    return [];
  }
  @ApiOperation({ summary: 'Get a board by ID' })
  @ApiOkResponse({ type: BoardResponse })
  @Serialize(BoardResponse)
  @Get(':id')
  async findOne(@Param('id') id: string) {
    this.logger.log(`Fetching board with id: ${id}`);
    return this.boardsService.findById(id);
  }
  @ApiOperation({ summary: 'Update a board' })
  @ApiOkResponse({ type: BoardResponse })
  @Serialize(BoardResponse)
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
