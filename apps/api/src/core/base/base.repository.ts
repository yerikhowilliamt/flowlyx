export interface BaseRepository<T> {
  findAll(query?: unknown): Promise<T[]>;
  findById(id: string): Promise<T | null>;
  create(data: unknown): Promise<T>;
  update(id: string, data: unknown): Promise<T>;
  delete(id: string): Promise<boolean>;
}
