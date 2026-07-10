import { Injectable } from '@nestjs/common';

@Injectable()
export class HealthService {
  checkLive() {
    return { status: 'UP', timestamp: new Date().toISOString() };
  }

  checkReady() {
    // In a real app, you would check DB connection here
    return { status: 'UP', timestamp: new Date().toISOString() };
  }
}
