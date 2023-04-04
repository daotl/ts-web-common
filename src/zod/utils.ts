import * as R from 'remeda'
import type { ZodObject, ZodRawShape, ZodTypeAny } from 'zod'
import { z, ZodNullable, ZodOptional } from 'zod'

// (extension: ZodRawShape) => (original: ZodObject) => (extended: ZodObject)
export const extendSchemaWith =
  <Shape extends ZodRawShape>(extension: Shape) =>
  <
    T extends ZodRawShape,
    UnknownKeys extends 'passthrough' | 'strict' | 'strip',
    Catchall extends ZodTypeAny,
    Output,
    Input,
  >(
    schema: ZodObject<T, UnknownKeys, Catchall, Output, Input>,
  ) =>
    schema.extend(extension)

// Make specified properties of ZodObject nullish.
export type NullishProps<
  Schema extends ZodRawShape,
  Keys extends (keyof Schema)[],
> = ZodObject<{
  [K in keyof Schema]: K extends Keys[number]
    ? ZodOptional<ZodNullable<Schema[K]>>
    : Schema[K]
}>

// Make specified properties of ZodObject nullish.
export const nullishProps = <
  Schema extends ZodRawShape,
  Keys extends (keyof Schema)[],
>(
  schema: ZodObject<Schema>,
  keys: Keys,
) =>
  z.object(
    R.mapValues(schema.shape, (schema, k) =>
      keys.includes(k) ? schema.nullish() : schema,
    ),
  ) as NullishProps<Schema, Keys>
