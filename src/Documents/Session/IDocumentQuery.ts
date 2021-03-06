import {QueryResultsWithStatistics} from "./DocumentQuery";
import {QueryResultsCallback, EntityCallback, EntitiesCountCallback} from "../../Typedef/Callbacks";
import {IRavenObject} from "../../Typedef/IRavenObject";
import {DocumentConstructor, DocumentConventions, DocumentType} from "../Conventions/DocumentConventions";
import {ConditionValue, OrderingType, QueryOperator, SearchOperator} from "./Query/QueryLanguage";
import {SpatialCriteria} from "./Query/Spatial/SpatialCriteria";
import {WhereParams, IWhereParams} from "./Query/WhereParams";
import {SpatialUnit} from "./Query/Spatial/SpatialUnit";
import {SpatialRelation} from "./Query/Spatial/SpatialRelation";
import {IOptionsSet} from "../../Typedef/IOptionsSet";
import {IndexQuery} from "../../Database/Indexes/IndexQuery";
import {IObservable} from "../../Utility/Observable";

export interface IDocumentQueryOptions<T> {
  collection?: string;
  documentType?: DocumentType<T>,
  indexName?: string;
  nestedObjectTypes?: IRavenObject<DocumentConstructor>;
  withStatistics?: boolean;
  indexQueryOptions?: IOptionsSet;
}

export interface IDocumentQueryBase<T extends Object = IRavenObject> extends IObservable {
  indexName: string;
  collectionName: string;
  conventions: DocumentConventions;  
  getIndexQuery(): IndexQuery;
  waitForNonStaleResults(): this;
  waitForNonStaleResultsAsOf(cutOffEtag: number, waitTimeout?: number): this;
  take(count: number): this;
  skip(count: number): this;
  first(callback?: EntityCallback<T>): Promise<T>;
  single(callback?: EntityCallback<T>): Promise<T>;
  all(callback?: QueryResultsCallback<T[]>): Promise<T[]>;
  all(callback?: QueryResultsCallback<QueryResultsWithStatistics<T>>): Promise<QueryResultsWithStatistics<T>>;
  count(callback?: EntitiesCountCallback): Promise<number>;
}

export interface IRawDocumentQuery<T extends Object = IRavenObject> extends IDocumentQueryBase<T> {
  rawQuery(query: string): IRawDocumentQuery<T>;
  addParameter<V extends ConditionValue>(name: string, value: V): IRawDocumentQuery<T>;
}

export interface IDocumentQuery<T extends Object = IRavenObject> extends IDocumentQueryBase<T> {
  not: IDocumentQuery<T>;
  isDynamicMapReduce: boolean;  
  selectFields(fields: string[]): IDocumentQuery<T>;
  selectFields(fields: string[], projections: string[]): IDocumentQuery<T>;
  getProjectionFields(): string[];
  randomOrdering(seed?: string): IDocumentQuery<T>;
  customSortUsing(typeName: string, descending?: boolean): IDocumentQuery<T>;
  include(path: string): IDocumentQuery<T>;
  usingDefaultOperator(operator: QueryOperator): IDocumentQuery<T>;
  whereEquals<V extends ConditionValue>(whereParams: IWhereParams<V>): IDocumentQuery<T>;
  whereEquals<V extends ConditionValue>(whereParams: WhereParams<V>): IDocumentQuery<T>;
  whereEquals<V extends ConditionValue>(fieldName: string, value: V, exact?: boolean): IDocumentQuery<T>;
  whereNotEquals<V extends ConditionValue>(whereParams: IWhereParams<V>): IDocumentQuery<T>;
  whereNotEquals<V extends ConditionValue>(whereParams: WhereParams<V>): IDocumentQuery<T>;
  whereNotEquals<V extends ConditionValue>(fieldName: string, value: V, exact?: boolean): IDocumentQuery<T>;
  openSubclause(): IDocumentQuery<T>;
  closeSubclause(): IDocumentQuery<T>;
  negateNext(): IDocumentQuery<T>;
  whereIn<V extends ConditionValue>(fieldName: string, values: V[], exact?: boolean): IDocumentQuery<T>;
  whereStartsWith<V extends ConditionValue>(fieldName: string, value: V): IDocumentQuery<T>;
  whereEndsWith<V extends ConditionValue>(fieldName: string, value: V): IDocumentQuery<T>;
  whereBetween<V extends ConditionValue>(fieldName: string, start: V, end: V, exact?: boolean): IDocumentQuery<T>;
  whereGreaterThan<V extends ConditionValue>(fieldName: string, value: V, exact?: boolean): IDocumentQuery<T>;
  whereGreaterThanOrEqual<V extends ConditionValue>(fieldName: string, value: V, exact?: boolean): IDocumentQuery<T>;
  whereLessThan<V extends ConditionValue>(fieldName: string, value: V, exact?: boolean): IDocumentQuery<T>;
  whereLessThanOrEqual<V extends ConditionValue>(fieldName: string, value: V, exact?: boolean): IDocumentQuery<T>;
  whereExists(fieldName: string): IDocumentQuery<T>;
  andAlso(): IDocumentQuery<T>;
  orElse(): IDocumentQuery<T>;
  boost(boost: number): IDocumentQuery<T>;
  fuzzy(fuzzy: number): IDocumentQuery<T>;
  proximity(proximity: number): IDocumentQuery<T>;
  orderBy(field: string, ordering?: OrderingType): IDocumentQuery<T>;
  orderByDescending(field: string, ordering?: OrderingType): IDocumentQuery<T>;
  orderByScore(): IDocumentQuery<T>;
  orderByScoreDescending(): IDocumentQuery<T>;
  search(fieldName: string, searchTerms: string, operator?: SearchOperator): IDocumentQuery<T>;
  intersect(): IDocumentQuery<T>;
  distinct(): IDocumentQuery<T>;
  containsAny<V extends ConditionValue>(fieldName: string, values: V[]): IDocumentQuery<T>;
  containsAll<V extends ConditionValue>(fieldName: string, values: V[]): IDocumentQuery<T>;
  groupBy(fieldName: string, ...fieldNames: string[]): IDocumentQuery<T>;
  groupByKey(fieldName: string, projectedName?: string): IDocumentQuery<T>;
  groupBySum(fieldName: string, projectedName?: string): IDocumentQuery<T>;
  groupByCount(projectedName?: string): IDocumentQuery<T>;
  whereTrue(): IDocumentQuery<T>;
  withinRadiusOf(fieldName: string, radius: number, latitude: number, longitude: number, radiusUnits?: SpatialUnit, distErrorPercent?: number): IDocumentQuery<T>;
  spatial(fieldName: string, shapeWkt: string, relation: SpatialRelation, distErrorPercent: number): IDocumentQuery<T>;
  spatial(fieldName: string, criteria: SpatialCriteria): IDocumentQuery<T>;
  orderByDistance(fieldName: string, latitude: number, longitude: number): IDocumentQuery<T>;
  orderByDistance(fieldName: string, shapeWkt: string): IDocumentQuery<T>;
  orderByDistanceDescending(fieldName: string, latitude: number, longitude: number): IDocumentQuery<T>;
  orderByDistanceDescending(fieldName: string, shapeWkt: string): IDocumentQuery<T>;
}