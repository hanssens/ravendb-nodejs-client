import * as _ from "lodash";
import {TypeUtil} from "../Utility/TypeUtil";
import {DateUtil} from "../Utility/DateUtil";
import {ArrayUtil} from "../Utility/ArrayUtil";
import {DocumentConventions, DocumentConstructor} from "../Documents/Conventions/DocumentConventions";
import {IRavenObject} from "../Typedef/IRavenObject";

export interface ISerialized<T extends Object = IRavenObject> {
  source: object | T;
  target?: object | T;
  originalAttribute: string;
  serializedAttribute: string;
  originalValue: any;
  serializedValue: any;  
  attributePath: string;
  metadata?: object;
  nestedObjectTypes?: IRavenObject<DocumentConstructor>;
}

export interface IAttributeSerializer {
  onUnserialized?: (serialized: ISerialized) => void;
  onSerialized?: (serialized: ISerialized) => void;  
}

export class Serializer {
  public static fromJSON<T extends Object = IRavenObject>(target: T, source: object | string, metadata: object | null = {}, nestedObjectTypes: IRavenObject<DocumentConstructor> = {}, conventions?: DocumentConventions, parentPath?: string): T {
    let mapping: object = {};

    let sourceObject: object = TypeUtil.isString(source)
      ? JSON.parse(source as string) : source;
    
    const mergeMaps: (documentTypes: object) => void = (documentTypes: object): void => {
      for (let key in documentTypes) {
        let documentType: Function | DocumentConstructor | string;
        let existingObjectType: Function | DocumentConstructor | string;
      
        if ((documentType = documentTypes[key]) && (!(key in mapping) 
          || (('string' === (typeof (existingObjectType = mapping[key]))) 
          && ('function' === (typeof documentType)) 
          && (existingObjectType === (<Function>documentType).name))
        )) {
          mapping[key] = documentType;
        }
      }
    };

    const prepareMaps: () => void = (): void => {
      Object.keys(mapping).forEach((key: string) => {
        if ('date' === mapping[key]) {
          mapping[key] = Date;
        } else if (conventions && ('function' !== (typeof mapping[key]))) {
          mapping[key] = conventions.getDocumentConstructor(mapping[key]);
        }

        if ('function' !== (typeof mapping[key])) {
          delete mapping[key];
        }
      });
    }
    
    const transform: (value: any, key?: string) => any = (value, key) => {
      let nestedObjectConstructor: DocumentConstructor;
      let nestedObject: IRavenObject = {};

      if ((key in mapping) && ('function' === (typeof (nestedObjectConstructor = mapping[key])))) {
        if (nestedObjectConstructor === Date) {
          return DateUtil.parse(value)
        }
      }

      if (TypeUtil.isObject(value)) {
        if (value instanceof Date) {
          return value;
        }

        if (nestedObjectConstructor) {
          nestedObject = new nestedObjectConstructor();
        }

        return this.fromJSON<typeof nestedObject>(
          nestedObject, value, (key in mapping)  
          ? value['@metadata'] || {} : null, null,
          conventions, this.buildPath(key, parentPath)
        );
      }

      if (TypeUtil.isArray(value)) {
        return value.map((item: any): any => transform(item, key))
      }

      return value;
    };

    if (metadata && metadata['@nested_object_types']) {
      mergeMaps(metadata['@nested_object_types']);
    }

    if (nestedObjectTypes && _.size(nestedObjectTypes)) {
      mergeMaps(nestedObjectTypes);
    }

    prepareMaps();

    Object.keys(sourceObject).forEach((key: string) => {
      let source: any = sourceObject[key];

      if ('undefined' !== (typeof source)) {
        let serialized: ISerialized<T> = {
          originalAttribute: key,
          serializedAttribute: key,
          originalValue: source,
          serializedValue: transform(source, key),
          attributePath: this.buildPath(key, parentPath),
          source, target, metadata, nestedObjectTypes
        };

        if (conventions) {
          conventions.serializers.forEach((serializer: IAttributeSerializer): void => {
            if (serializer.onUnserialized) {
              serializer.onUnserialized(serialized);
            }            
          });
        }
        
        target[serialized.serializedAttribute] = serialized.serializedValue;
      }
    });

    if (!TypeUtil.isNull(metadata)) {
      target['@metadata'] = metadata || {};
    }
    
    return target;
  }

  public static toJSON<T extends Object = IRavenObject>(source: T, conventions?: DocumentConventions, parentPath?: string): object {
    let json: object = {};

    const transform: (value: any, key?: string) => any = (value, key) => {
      if ('@metadata' === key) {
        return value;
      }

      if (value instanceof Date) {
        return DateUtil.stringify(value);
      }

      if (TypeUtil.isObject(value)) {
        return this.toJSON<IRavenObject>(value, conventions, parentPath);
      }

      if (TypeUtil.isArray(value)) {
        return value.map((item: any): any => transform(item, key))
      }

      return value;
    };

    Object.keys(source).forEach((key: string) => {
      let sourceValue: any = source[key];

      let serialized: ISerialized = {
        originalAttribute: key,
        serializedAttribute: key,
        originalValue: sourceValue,
        serializedValue: transform(sourceValue, key),
        attributePath: this.buildPath(key, parentPath),
        source, metadata: source['@metadata'] || {}
      };

      if (('@metadata' !== key) && conventions) {
        conventions.serializers.forEach((serializer: IAttributeSerializer): void => {
          if (serializer.onSerialized) {
            serializer.onSerialized(serialized);
          }          
        });
      }
      
      json[serialized.serializedAttribute] = serialized.serializedValue;
    });

    return json;
  }

  private static buildPath(attribute: string, parentPath?: string): string {
    if (parentPath) {
      return `${parentPath}.${attribute}`;
    }

    return attribute;
  }
}