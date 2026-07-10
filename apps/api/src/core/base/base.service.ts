export interface BaseService<T> {
  findAll(query?: unknown): Promise<T[]>;
  findById(id: string): Promise<T>;
  create(data: unknown): Promise<T>;
  update(id: string, data: unknown): Promise<T>;
  delete(id: string): Promise<boolean>;
}
