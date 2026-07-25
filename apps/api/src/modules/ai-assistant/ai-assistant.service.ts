import {
  Injectable,
  Logger,
  ServiceUnavailableException,
  BadGatewayException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { ChatDto, ChatResponseDto } from './dto/chat.dto';
import { SuggestTaskDto, SuggestTaskResponseDto } from './dto/suggest-task.dto';
import { SummarizeDto, SummarizeResponseDto } from './dto/summarize.dto';
import { EnvConfig } from '../../core/config/env.validation';

@Injectable()
export class AiAssistantService {
  private readonly logger = new Logger(AiAssistantService.name);
  private readonly client: OpenAI | null;
  private readonly model: string;

  constructor(private readonly config: ConfigService<EnvConfig>) {
    const apiKey = this.config.get('OPENAI_API_KEY');
    this.model = this.config.get('OPENAI_MODEL') ?? 'gpt-4o-mini';

    if (apiKey) {
      this.client = new OpenAI({ apiKey });
      this.logger.log({ msg: 'OpenAI client initialized', model: this.model });
    } else {
      this.client = null;
      this.logger.warn({ msg: 'OPENAI_API_KEY not set — AI Assistant endpoints will return 503' });
    }
  }

  private ensureClient(): OpenAI {
    if (!this.client) {
      throw new ServiceUnavailableException('AI Assistant is not configured. Set OPENAI_API_KEY.');
    }
    return this.client;
  }

  private async callOpenAI(
    systemPrompt: string,
    userPrompt: string,
  ): Promise<OpenAI.Chat.Completions.ChatCompletion> {
    const client = this.ensureClient();
    try {
      const start = Date.now();
      const completion = await client.chat.completions.create({
        model: this.model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.7,
        max_tokens: 1024,
      });
      this.logger.log({
        msg: 'OpenAI request completed',
        model: this.model,
        durationMs: Date.now() - start,
        promptTokens: completion.usage?.prompt_tokens,
        completionTokens: completion.usage?.completion_tokens,
      });
      return completion;
    } catch (error) {
      this.logger.error({ msg: 'OpenAI API error', error: (error as Error).message });
      throw new BadGatewayException('AI service returned an error. Please try again.');
    }
  }

  async chat(dto: ChatDto, userId: string): Promise<ChatResponseDto> {
    this.logger.log({ msg: 'AI chat request', userId, contextLength: dto.context?.length ?? 0 });

    const system = dto.context
      ? `You are Flowlyx AI, a helpful project management assistant. Context: ${dto.context}`
      : 'You are Flowlyx AI, a helpful project management assistant.';

    const completion = await this.callOpenAI(system, dto.message);
    const reply = completion.choices[0]?.message?.content ?? '';

    return {
      reply,
      model: completion.model,
      promptTokens: completion.usage?.prompt_tokens ?? 0,
      completionTokens: completion.usage?.completion_tokens ?? 0,
    };
  }

  async suggestTask(dto: SuggestTaskDto, userId: string): Promise<SuggestTaskResponseDto> {
    this.logger.log({ msg: 'AI suggest-task request', userId });

    const system =
      'You are Flowlyx AI, a project management assistant. Respond ONLY with valid JSON matching this schema: { "title": string, "description": string, "suggestedPriority": "LOW"|"MEDIUM"|"HIGH"|"URGENT", "subtasks": string[] }. No markdown, no extra text.';

    const userPrompt = dto.projectContext
      ? `Project context: ${dto.projectContext}\n\nTask description: ${dto.description}`
      : `Task description: ${dto.description}`;

    const completion = await this.callOpenAI(system, userPrompt);
    const raw = completion.choices[0]?.message?.content ?? '{}';

    try {
      const parsed = JSON.parse(raw) as SuggestTaskResponseDto;
      return {
        title: parsed.title ?? '',
        description: parsed.description ?? '',
        suggestedPriority: parsed.suggestedPriority ?? 'MEDIUM',
        subtasks: Array.isArray(parsed.subtasks) ? parsed.subtasks : [],
      };
    } catch {
      this.logger.error({ msg: 'Failed to parse AI suggest-task response', raw });
      throw new BadGatewayException('AI returned an unexpected format. Please retry.');
    }
  }

  async summarize(dto: SummarizeDto, userId: string): Promise<SummarizeResponseDto> {
    this.logger.log({ msg: 'AI summarize request', userId, contentLength: dto.content.length });

    const system =
      'You are Flowlyx AI. Summarize the provided text concisely. Respond ONLY with valid JSON: { "summary": string, "keyPoints": string[] }. No markdown, no extra text.';

    const completion = await this.callOpenAI(system, dto.content);
    const raw = completion.choices[0]?.message?.content ?? '{}';

    try {
      const parsed = JSON.parse(raw) as SummarizeResponseDto;
      return {
        summary: parsed.summary ?? '',
        keyPoints: Array.isArray(parsed.keyPoints) ? parsed.keyPoints : [],
      };
    } catch {
      this.logger.error({ msg: 'Failed to parse AI summarize response', raw });
      throw new BadGatewayException('AI returned an unexpected format. Please retry.');
    }
  }
}
