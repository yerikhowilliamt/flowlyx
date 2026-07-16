import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { TaskAssignmentsController } from './task-assignments.controller';
import { TaskAssignmentsService } from './task-assignments.service';

describe('TaskAssignmentsController', () => {
  let controller: TaskAssignmentsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TaskAssignmentsController],
      providers: [
        { provide: JwtService, useValue: {} },
        { provide: ConfigService, useValue: {} },
        { provide: TaskAssignmentsService, useValue: {} },
      ],
    }).compile();

    controller = module.get<TaskAssignmentsController>(TaskAssignmentsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
