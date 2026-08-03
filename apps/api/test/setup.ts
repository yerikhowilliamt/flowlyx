import * as dotenv from 'dotenv';
import { join } from 'path';

// Load .env.test specifically for E2E tests
dotenv.config({ path: join(__dirname, '../.env.test') });
