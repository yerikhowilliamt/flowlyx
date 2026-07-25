import { Controller, Post, Body, HttpCode, HttpStatus, UseGuards, Logger } from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiOkResponse,
  ApiServiceUnavailableResponse,
  ApiBadGatewayResponse,
} from '@nestjs/swagger';
import { AiAssistantService } from './ai-assistant.service';
import { ChatDto, ChatResponseDto } from './dto/chat.dto';
import { SuggestTaskDto, SuggestTaskResponseDto } from './dto/suggest-task.dto';
import { SummarizeDto, SummarizeResponseDto } from './dto/summarize.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '@flowlyx/database';

@ApiTags('AI Assistant')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('ai-assistant')
export class AiAssistantController {
  private readonly logger = new Logger(AiAssistantController.name);

  constructor(private readonly aiAssistantService: AiAssistantService) {}

  @Post('chat')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Send a message to Flowlyx AI and receive a response' })
  @ApiOkResponse({ type: ChatResponseDto })
  @ApiServiceUnavailableResponse({ description: 'OPENAI_API_KEY not configured' })
  @ApiBadGatewayResponse({ description: 'OpenAI API error' })
  async chat(@Body() dto: ChatDto, @CurrentUser() user: User): Promise<ChatResponseDto> {
    this.logger.log({ msg: 'POST /ai-assistant/chat', userId: user.id });
    return this.aiAssistantService.chat(dto, user.id);
  }

  @Post('suggest-task')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get AI-powered task field suggestions based on a description' })
  @ApiOkResponse({ type: SuggestTaskResponseDto })
  @ApiServiceUnavailableResponse({ description: 'OPENAI_API_KEY not configured' })
  @ApiBadGatewayResponse({ description: 'OpenAI API error' })
  async suggestTask(
    @Body() dto: SuggestTaskDto,
    @CurrentUser() user: User,
  ): Promise<SuggestTaskResponseDto> {
    this.logger.log({ msg: 'POST /ai-assistant/suggest-task', userId: user.id });
    return this.aiAssistantService.suggestTask(dto, user.id);
  }

  @Post('summarize')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Summarize text content using AI' })
  @ApiOkResponse({ type: SummarizeResponseDto })
  @ApiServiceUnavailableResponse({ description: 'OPENAI_API_KEY not configured' })
  @ApiBadGatewayResponse({ description: 'OpenAI API error' })
  async summarize(
    @Body() dto: SummarizeDto,
    @CurrentUser() user: User,
  ): Promise<SummarizeResponseDto> {
    this.logger.log({ msg: 'POST /ai-assistant/summarize', userId: user.id });
    return this.aiAssistantService.summarize(dto, user.id);
  }
}
