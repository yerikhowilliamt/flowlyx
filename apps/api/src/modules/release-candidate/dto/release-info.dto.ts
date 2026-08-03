import { ApiProperty } from '@nestjs/swagger';

export class ReleaseInfoDto {
  @ApiProperty({ example: '1.0.0', description: 'The release version of the application' })
  version!: string;

  @ApiProperty({ example: 'production-ready', description: 'The status of the release' })
  status!: string;

  @ApiProperty({ example: '2026-08-03T00:00:00.000Z', description: 'The timestamp of the release' })
  timestamp!: string;
}
