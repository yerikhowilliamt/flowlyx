import { Test, TestingModule } from '@nestjs/testing';
import { ReleaseCandidateService } from './release-candidate.service';

describe('ReleaseCandidateService', () => {
  let service: ReleaseCandidateService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ReleaseCandidateService],
    }).compile();

    service = module.get<ReleaseCandidateService>(ReleaseCandidateService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return version 1.0.0 info', () => {
    const info = service.getVersionInfo();
    expect(info.version).toBe('1.0.0');
    expect(info.status).toBe('production-ready');
    expect(info.timestamp).toBeDefined();
  });
});
