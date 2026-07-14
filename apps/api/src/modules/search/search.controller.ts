import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { SearchService } from './search.service';
import { SearchQueryDto } from './dto/search-query.dto';

@ApiTags('Search')
@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get()
  @ApiOperation({ summary: 'Global search across tasks, projects, and workspaces' })
  @ApiResponse({ status: 200, description: 'Returns grouped search results' })
  async search(@Query() queryDto: SearchQueryDto) {
    return this.searchService.search(queryDto);
  }
}
