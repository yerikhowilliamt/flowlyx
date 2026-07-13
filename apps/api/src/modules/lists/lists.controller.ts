import { ListResponse, ListSummary } from '../../models/list.model';
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
import { ListsService } from './lists.service';
import { CreateListDto } from './dto/create-list.dto';
import { UpdateListDto } from './dto/update-list.dto';
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
@ApiTags('Lists')
@Controller('lists')
export class ListsController {
  private readonly logger = new Logger(ListsController.name);

  constructor(private readonly listsService: ListsService) {}
  @ApiOperation({ summary: 'Create a new list' })
  @ApiCreatedResponse({ type: ListResponse })
  @Serialize(ListResponse)
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createListDto: CreateListDto) {
    this.logger.log(`Creating list in board: ${createListDto.boardId}`);
    return this.listsService.create(createListDto);
  }
  @ApiOperation({ summary: 'List all lists' })
  @ApiOkResponse({ type: [ListSummary] })
  @Serialize([ListSummary])
  @Get()
  async findAll(@Query() query: PaginationDto, @Query('boardId') boardId?: string) {
    if (boardId) {
      this.logger.log(`Fetching lists for boardId: ${boardId}`);
      return this.listsService.findAllByBoardId(boardId, query);
    }
    this.logger.log('Fetching all lists is not supported without boardId, returning empty');
    return [];
  }
  @ApiOperation({ summary: 'Get a list by ID' })
  @ApiOkResponse({ type: ListResponse })
  @Serialize(ListResponse)
  @Get(':id')
  async findOne(@Param('id') id: string) {
    this.logger.log(`Fetching list with id: ${id}`);
    return this.listsService.findById(id);
  }
  @ApiOperation({ summary: 'Update a list' })
  @ApiOkResponse({ type: ListResponse })
  @Serialize(ListResponse)
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
