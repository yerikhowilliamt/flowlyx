import { FileEntity } from '../entities/file.entity';

export class FileResponseDto extends FileEntity {
  constructor(partial: Partial<FileResponseDto>) {
    super();
    Object.assign(this, partial);
  }
}
