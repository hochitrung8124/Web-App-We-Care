/**
 * Mapper Interface
 * Định nghĩa contract cho data transformation
 */

export interface IMapper<TSource, TDestination> {
  /**
   * Map từ source sang destination
   */
  map(source: TSource): TDestination;
  
  /**
   * Map ngược từ destination về source (nếu cần)
   */
  mapReverse?(destination: TDestination): Partial<TSource>;
}
