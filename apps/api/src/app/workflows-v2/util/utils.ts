import _, { flatMap, values } from 'lodash';

import { BadRequestException } from '@nestjs/common';

import { JSONSchemaDto } from '@novu/shared';

export function findMissingKeys(requiredRecord: object, actualRecord: object) {
  const requiredKeys = collectKeys(requiredRecord);
  const actualKeys = collectKeys(actualRecord);

  return _.difference(requiredKeys, actualKeys);
}

export function collectKeys(obj, prefix = '') {
  return _.reduce(
    obj,
    (result, value, key) => {
      const newKey = prefix ? `${prefix}.${key}` : key;
      if (_.isObject(value) && !_.isArray(value)) {
        result.push(...collectKeys(value, newKey));
      } else {
        result.push(newKey);
      }

      return result;
    },
    []
  );
}

/**
 * Recursively flattens an object's values into an array of strings.
 * Handles nested objects, arrays, and converts primitive values to strings.
 *
 * @param obj - The object to flatten
 * @returns An array of strings containing all primitive values found in the object
 *
 * @example
 * ```typescript
 * const input = {
 *   subject: "Hello {{name}}",
 *   body: "Welcome!",
 *   actions: {
 *     primary: {
 *       label: "Click {{here}}",
 *       url: "https://example.com"
 *     }
 *   },
 *   data: { count: 42 }
 * };
 *
 * flattenObjectValues(input);
 *  Returns:
 *  [
 *    "Hello {{name}}",
 *    "Welcome!",
 *    "Click {{here}}",
 *    "https://example.com",
 *    "42"
 *  ]
 * ```
 */
export function flattenObjectValues(obj: Record<string, unknown>): string[] {
  return flatMap(values(obj), (value) => {
    if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
      return String(value);
    }
    if (value && typeof value === 'object') {
      return flattenObjectValues(value as Record<string, unknown>);
    }

    return [];
  });
}

/**
 * Recursively adds missing defaults for properties in a JSON schema object.
 * For properties without defaults, adds interpolated path as the default value.
 * Handles nested objects by recursively processing their properties.
 *
 * @param {Object} schema - The JSON schema object to process
 * @param {string} parentPath - The parent path for building default values (default: 'payload')
 * @returns {Object} The schema with missing defaults added
 *
 * @example
 * const schema = {
 *   properties: {
 *     name: { type: 'string' },
 *     address: {
 *       type: 'object',
 *       properties: {
 *         street: { type: 'string' }
 *       }
 *     }
 *   }
 * };
 *
 * const result = addMissingDefaults(schema);
 * // Result:
 * // {
 * //   properties: {
 * //     name: {
 * //       type: 'string',
 * //       default: '{{payload.name}}'
 * //     },
 * //     address: {
 * //       type: 'object',
 * //       properties: {
 * //         street: {
 * //           type: 'string',
 * //           default: '{{payload.address.street}}'
 * //         }
 * //       }
 * //     }
 * //   }
 * // }
 */
export function mockSchemaDefaults(schema: JSONSchemaDto, parentPath = 'payload', depth = 0) {
  const MAX_DEPTH = 10;

  if (depth >= MAX_DEPTH) {
    return schema;
  }

  if (schema.properties) {
    Object.entries(schema.properties).forEach(([key, value]) => {
      const valueDto = value as JSONSchemaDto;
      if (valueDto.type === 'object') {
        mockSchemaDefaults(valueDto, `${parentPath}.${key}`, depth + 1);
      }

      if (!valueDto.default && valueDto.type !== 'object') {
        valueDto.default = `{{${parentPath}.${key}}}`;
      }
    });
  }

  return schema;
}
