/**
 * Repository Interface
 * Định nghĩa contract cho data access layer
 */

import { IDataverseQueryOptions } from './IDataverseEntities';

export interface IRepository<TEntity, TModel> {
  /**
   * Lấy danh sách entities
   */
  getAll(options?: IDataverseQueryOptions): Promise<TModel[]>;
  
  /**
   * Lấy entity theo ID
   */
  getById(id: string): Promise<TModel>;
  
  /**
   * Tạo mới entity
   */
  create(data: Partial<TModel>): Promise<string>;
  
  /**
   * Cập nhật entity
   */
  update(id: string, data: Partial<TModel>): Promise<void>;
  
  /**
   * Xóa entity (nếu cần)
   */
  delete?(id: string): Promise<void>;
}
