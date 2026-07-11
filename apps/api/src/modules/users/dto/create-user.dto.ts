import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

const createUserSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  password: z.string().min(8).max(100),
});

export class CreateUserDto extends createZodDto(createUserSchema) {}
