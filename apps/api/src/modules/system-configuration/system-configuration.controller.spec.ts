import { Test, TestingModule } from '@nestjs/testing';
import { SystemConfigurationController } from './system-configuration.controller';
import { SystemConfigurationService } from './system-configuration.service';

describe('SystemConfigurationController', () => {
  let controller: SystemConfigurationController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SystemConfigurationController],
      providers: [
        {
          provide: SystemConfigurationService,
          useValue: {},
        },
      ],
    }).compile();

    controller = module.get<SystemConfigurationController>(SystemConfigurationController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
