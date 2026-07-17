import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class Paging {
  @ApiProperty()
  size!: number;

  @ApiProperty()
  totalData!: number;

  @ApiProperty()
  totalPage!: number;

  @ApiProperty()
  currentPage!: number;
}

export class ErrorResponse {
  @ApiPropertyOptional()
  field!: string;

  @ApiProperty()
  message!: string;
}

export class ApiResponse<T = unknown> {
  @ApiProperty()
  success!: boolean;

  @ApiPropertyOptional()
  data?: T | T[];

  @ApiPropertyOptional()
  message?: string;

  @ApiPropertyOptional({ type: [ErrorResponse] })
  errors?: ErrorResponse[];

  @ApiPropertyOptional()
  status?: number;

  @ApiPropertyOptional({ type: Paging })
  paging?: Paging;

  @ApiPropertyOptional()
  code?: string;

  @ApiPropertyOptional()
  timestamp?: string;
}

export class SuccessResponse {
  @ApiProperty({ example: true })
  success!: boolean;
}
