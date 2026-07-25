import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { ServiceUnavailableException, BadGatewayException } from '@nestjs/common';
import { AiAssistantService } from './ai-assistant.service';

const mockCreate = jest.fn();

jest.mock('openai', () => {
  return jest.fn().mockImplementation(() => ({
    chat: {
      completions: {
        create: mockCreate,
      },
    },
  }));
});

const mockCompletion = (content: string) => ({
  model: 'gpt-4o-mini',
  choices: [{ message: { content } }],
  usage: { prompt_tokens: 10, completion_tokens: 20 },
});

describe('AiAssistantService', () => {
  let service: AiAssistantService;

  const configWithKey = {
    get: (key: string) => {
      if (key === 'OPENAI_API_KEY') return 'sk-test';
      if (key === 'OPENAI_MODEL') return 'gpt-4o-mini';
      return undefined;
    },
  };

  const configWithoutKey = {
    get: (key: string) => {
      if (key === 'OPENAI_MODEL') return 'gpt-4o-mini';
      return undefined;
    },
  };

  beforeEach(async () => {
    jest.clearAllMocks();
  });

  async function buildService(config: object): Promise<AiAssistantService> {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AiAssistantService, { provide: ConfigService, useValue: config }],
    }).compile();
    return module.get<AiAssistantService>(AiAssistantService);
  }

  describe('when OPENAI_API_KEY is not set', () => {
    beforeEach(async () => {
      service = await buildService(configWithoutKey);
    });

    it('should be defined', () => {
      expect(service).toBeDefined();
    });

    it('chat() should throw ServiceUnavailableException', async () => {
      await expect(service.chat({ message: 'hello' }, 'user-1')).rejects.toThrow(
        ServiceUnavailableException,
      );
    });

    it('suggestTask() should throw ServiceUnavailableException', async () => {
      await expect(service.suggestTask({ description: 'build login' }, 'user-1')).rejects.toThrow(
        ServiceUnavailableException,
      );
    });

    it('summarize() should throw ServiceUnavailableException', async () => {
      await expect(service.summarize({ content: 'some text' }, 'user-1')).rejects.toThrow(
        ServiceUnavailableException,
      );
    });
  });

  describe('when OPENAI_API_KEY is set', () => {
    beforeEach(async () => {
      service = await buildService(configWithKey);
    });

    describe('chat()', () => {
      it('should return reply and token counts', async () => {
        mockCreate.mockResolvedValueOnce(mockCompletion('Hello from AI!'));
        const result = await service.chat({ message: 'hi' }, 'user-1');
        expect(result.reply).toBe('Hello from AI!');
        expect(result.model).toBe('gpt-4o-mini');
        expect(result.promptTokens).toBe(10);
        expect(result.completionTokens).toBe(20);
      });

      it('should throw BadGatewayException when OpenAI throws', async () => {
        mockCreate.mockRejectedValueOnce(new Error('network error'));
        await expect(service.chat({ message: 'hi' }, 'user-1')).rejects.toThrow(
          BadGatewayException,
        );
      });
    });

    describe('suggestTask()', () => {
      it('should parse valid JSON response', async () => {
        const aiJson = JSON.stringify({
          title: 'Login Page',
          description: 'Implement login',
          suggestedPriority: 'HIGH',
          subtasks: ['Design UI', 'Add validation'],
        });
        mockCreate.mockResolvedValueOnce(mockCompletion(aiJson));
        const result = await service.suggestTask({ description: 'build login' }, 'user-1');
        expect(result.title).toBe('Login Page');
        expect(result.suggestedPriority).toBe('HIGH');
        expect(result.subtasks).toHaveLength(2);
      });

      it('should throw BadGatewayException on invalid JSON', async () => {
        mockCreate.mockResolvedValueOnce(mockCompletion('not-json'));
        await expect(service.suggestTask({ description: 'build login' }, 'user-1')).rejects.toThrow(
          BadGatewayException,
        );
      });
    });

    describe('summarize()', () => {
      it('should parse valid JSON response', async () => {
        const aiJson = JSON.stringify({
          summary: 'Short summary',
          keyPoints: ['Point A', 'Point B'],
        });
        mockCreate.mockResolvedValueOnce(mockCompletion(aiJson));
        const result = await service.summarize({ content: 'long text...' }, 'user-1');
        expect(result.summary).toBe('Short summary');
        expect(result.keyPoints).toHaveLength(2);
      });

      it('should throw BadGatewayException on invalid JSON', async () => {
        mockCreate.mockResolvedValueOnce(mockCompletion('not-json'));
        await expect(service.summarize({ content: 'long text...' }, 'user-1')).rejects.toThrow(
          BadGatewayException,
        );
      });
    });
  });
});
