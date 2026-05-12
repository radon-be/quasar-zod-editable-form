import z from 'zod'

export type ZodRowType<T extends z.ZodRawShape> = z.infer<z.ZodObject<T>>

type PrevDepth = [never, 0, 1, 2, 3, 4, 5, 6]

export type FlattenKeys<T, P extends string = ''> = {
  [K in keyof T & string]: T[K] extends z.ZodObject<infer R>
    ? FlattenKeys<R, `${P}${K}.`>
    : T[K] extends z.ZodOptional<z.ZodObject<infer R>>
      ? FlattenKeys<R, `${P}${K}.`>
      : T[K] extends z.ZodNullable<z.ZodObject<infer R>>
        ? FlattenKeys<R, `${P}${K}.`>
        : `${P}${K}`
}[keyof T & string]

export type Primitive = string | number | boolean | bigint | symbol | null | undefined | Date

export type FlattenObjectKeys<T, P extends string = '', D extends number = 4> = [D] extends [0]
  ? never
  : {
  [K in keyof T & string]:
    NonNullable<T[K]> extends Primitive
      ? `${P}${K}`
      : NonNullable<T[K]> extends Array<any>
        ? `${P}${K}`
        : NonNullable<T[K]> extends Record<string, any>
          ? FlattenObjectKeys<NonNullable<T[K]>, `${P}${K}.`, PrevDepth[D]>
          : `${P}${K}`
}[keyof T & string]