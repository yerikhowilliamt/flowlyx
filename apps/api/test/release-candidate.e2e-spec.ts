import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request, { Response } from 'supertest';
import { AppModule } from '../src/app.module';

describe('Release Candidate Module (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/release-candidate/version (GET)', () => {
    return request(app.getHttpServer())
      .get('/release-candidate/version')
      .expect(200)
      .expect((res: Response) => {
        expect(res.body).toHaveProperty('version', '1.0.0-rc.1');
        expect(res.body).toHaveProperty('status', 'production-ready');
      });
  });
});
