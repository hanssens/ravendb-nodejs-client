import {IDocumentSession} from "./IDocumentSession";
import {AdvancedSessionOperations} from "./AdvancedSessionOperations";
import {IDocumentQuery, IDocumentQueryOptions} from "./IDocumentQuery";
import {DocumentQueryBase} from "./DocumentQuery";
import {DocumentConventions, DocumentConstructor, DocumentType} from '../Conventions/DocumentConventions';
import {AbstractCallback, EntityCallback, EntitiesArrayCallback} from '../../Typedef/Callbacks';
import {IRavenObject} from "../../Typedef/IRavenObject";
import {RequestExecutor} from '../../Http/Request/RequestExecutor';

export interface ISessionOptions {
  database?: string;
  requestExecutor?: RequestExecutor;
}

export interface ISessionOperationOptions<T> {
  documentType?: DocumentType<T>,
  includes?: string[],
  nestedObjectTypes?: IRavenObject<DocumentConstructor>,
  expectedChangeVector?: string,
  callback?: EntityCallback<T> | EntitiesArrayCallback<T>
}

export interface IDocumentSession {
  numberOfRequestsInSession: number;
  conventions: DocumentConventions;
  advanced: AdvancedSessionOperations;

  load<T extends Object = IRavenObject>(id: string, callback?: EntityCallback<T>): Promise<T>;
  load<T extends Object = IRavenObject>(id: string, options?: ISessionOperationOptions<T>, callback?: EntityCallback<T>): Promise<T>;
  load<T extends Object = IRavenObject>(ids: string[], callback?: EntityCallback<T>): Promise<T[]>;
  load<T extends Object = IRavenObject>(ids: string[], options?: ISessionOperationOptions<T>, callback?: EntitiesArrayCallback<T>): Promise<T[]>;
  delete<T extends Object = IRavenObject>(id: string, callback?: EntityCallback<T | null | void>): Promise<T | null | void>;
  delete<T extends Object = IRavenObject>(id: string, options?: ISessionOperationOptions<T | null | void>, callback?: EntityCallback<T | null | void>): Promise<T | null | void>;
  delete<T extends Object = IRavenObject>(document: T, callback?: EntityCallback<T | null | void>): Promise<T | null | void>;
  delete<T extends Object = IRavenObject>(document: T, options?: ISessionOperationOptions<T | null | void>, callback?: EntityCallback<T | null | void>): Promise<T | null | void>;
  store<T extends Object = IRavenObject>(document: T, id?: string, callback?: EntityCallback<T>): Promise<T>;
  store<T extends Object = IRavenObject>(document: T, id?: string, options?: ISessionOperationOptions<T>, callback?: EntityCallback<T>): Promise<T>;
  query<T extends Object = IRavenObject>(options?: IDocumentQueryOptions<T>): IDocumentQuery<T>;
  saveChanges(): Promise<void>;
}
