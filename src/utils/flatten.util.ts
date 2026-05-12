import { toValue, type MaybeRefOrGetter } from 'vue'
import z from 'zod'
import type {
  ExtraPropertyOptions,
  PropertyEditControlType,
  PropertyEditType,
  PropertyKeyType,
} from '../types/form.type'

/**
 * Flatten complex classes to dot-noted-properties
 *
 * const health = { type: 'default', office: { name: 'health office', meta: { foo: 'bar' }}}
 *
 * outputs: { type: 'default', 'office.name': 'health office', 'office.meta.foo': 'bar' }
 *
 * @param schema z.ZodTypeAny
 * @param prefix String - Mostly used recursively
 * @returns
 */
export function flattenSchema(schema: z.ZodTypeAny, prefix = ''): Record<string, z.ZodTypeAny> {
  const flat: Record<string, z.ZodTypeAny> = {}

  if (schema instanceof z.ZodObject) {
    for (const key in schema.shape) {
      const fieldSchema = schema.shape[key]
      const newKey = prefix ? `${prefix}.${key}` : key

      // unwrap optional or nullable types
      const unwrapped = fieldSchema._def?.innerType || fieldSchema

      if (unwrapped instanceof z.ZodObject) {
        Object.assign(flat, flattenSchema(unwrapped, newKey))
      } else {
        flat[newKey] = unwrapped
      }
    }
  }

  return flat
}

// safely get nested value
export function getNestedValue(obj: any, path: string) {
  return path.split('.').reduce((acc, key) => acc?.[key], obj)
}

// safely set nested value
export function setNestedValue<T extends object>(obj: MaybeRefOrGetter<T>, path: string, value: unknown) {
  const keys = path.split('.')
  let curr: any = toValue(obj)
  keys.forEach((k, i) => {
    if (i === keys.length - 1) {
      curr[k] = value
    } else {
      curr[k] = curr[k] ?? {}
      curr = curr[k]
    }
  })
}

type FormFieldMetaBase<K extends string = string> = {
  key: K
  label: string
  propertyEditType: PropertyEditType
  propertySchema: z.ZodTypeAny
  editable: boolean
  clearable?: boolean
}

type FormFieldMetaNoComponent<K extends string = string> = FormFieldMetaBase<K> & {
  controlType?: never
  options?: never
  optionLabel?: never
  optionValue?: never
  multiple?: never
  rows?: never
}

type FormFieldMetaText<K extends string = string> = FormFieldMetaBase<K> & {
  controlType?: 'text'
  rows?: never
}

type FormFieldMetaTextarea<K extends string = string> = FormFieldMetaBase<K> & {
  controlType: 'textarea'
  rows?: number
}

type FormFieldMetaSelect<K extends string = string> = FormFieldMetaBase<K> & {
  controlType: Extract<PropertyEditControlType, 'select'>
  options: Record<string, unknown>[]
  optionLabel: string
  optionValue: string
  multiple?: boolean
  rows?: never
}

type FormFieldMetaToggleOrCheckbox<K extends string = string> = FormFieldMetaBase<K> & {
  controlType: Extract<PropertyEditControlType, 'toggle' | 'checkbox'>
  options: Record<string, unknown>[]
  optionLabel: string
  optionValue: string
  multiple?: never
  rows?: never
}

type FormFieldMetaRadio<K extends string = string> = FormFieldMetaBase<K> & {
  controlType: Extract<PropertyEditControlType, 'radio'>
  options: Record<string, unknown>[]
  optionLabel: string
  optionValue: string
  multiple?: never
  rows?: never
}

export type FormFieldMeta<K extends string = string> =
  | FormFieldMetaNoComponent<K>
  | FormFieldMetaText<K>
  | FormFieldMetaTextarea<K>
  | FormFieldMetaSelect<K>
  | FormFieldMetaToggleOrCheckbox<K>
  | FormFieldMetaRadio<K>

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1)
}

function defaultLabel(path: string) {
  return capitalize(path.split('.').slice(-1)[0] ?? path)
}

function inferPropertyEditType(schema: z.ZodTypeAny): PropertyEditType {
  const unwrapped = (schema as any)?._def?.innerType ?? schema

  if (unwrapped instanceof z.ZodBoolean) return 'boolean'
  if (unwrapped instanceof z.ZodEnum || unwrapped instanceof z.enum) return 'static-enum'

  if (unwrapped instanceof z.ZodNumber) {
    const checks = (unwrapped as any)?._def?.checks ?? []
    const isInt = checks.some((c: any) => c.kind === 'int' || c.check === 'int')
    return isInt ? 'integer' : 'real'
  }

  if (unwrapped instanceof z.ZodString) {
    const checks = (unwrapped as any)?._def?.checks ?? []
    if (checks.some((c: any) => c.kind === 'datetime' || c.format === 'datetime')) return 'date-time'
    if (checks.some((c: any) => c.kind === 'date' || c.format === 'date')) return 'date'
    if (checks.some((c: any) => c.kind === 'time' || c.format === 'time')) return 'time'
    return 'string'
  }

  return 'custom'
}

export function mapSchemaToFormFields<TSchema extends z.ZodTypeAny>(args: {
  schema: TSchema
  editable?: boolean
  editableProperties?: Array<PropertyKeyType<z.infer<TSchema>> | '*'>
  extraPropertyOptions?: Partial<Record<PropertyKeyType<z.infer<TSchema>>, ExtraPropertyOptions>>
  showProperties?: Array<PropertyKeyType<z.infer<TSchema>> | '*'>
  hideProperties?: Array<PropertyKeyType<z.infer<TSchema>> | '*'>
}) {
  type Row = z.infer<TSchema>
  type Key = PropertyKeyType<Row>

  const flat = flattenSchema(args.schema) as Record<Key, z.ZodTypeAny>
  const allKeys = Object.keys(flat) as Key[]

  const show = args.showProperties
  const hide = args.hideProperties

  const allowAllVisible = !show || show.includes('*')

  const shownKeys: Key[] = allowAllVisible ? allKeys : show.filter((k): k is Key => k !== '*' && k in flat)

  const hideSet = new Set<Key>((hide ?? []).filter((k): k is Key => k !== '*' && k in flat))

  const hideAll = !!hide?.includes('*')

  const keys: Key[] = hideAll ? [] : shownKeys.filter((k) => !hideSet.has(k))

  const editableProps = args.editableProperties
  const editableGlobal = args.editable ?? true

  return keys.map<FormFieldMeta<Key>>((key) => {
    const schema = flat[key]
    const extra = args.extraPropertyOptions?.[key] ?? {}
    const propertyEditType = extra.propertyEditType ?? inferPropertyEditType(schema)

    const editableByProp =
      !editableProps || editableProps.includes('*') || editableProps.some((k): k is Key => k !== '*' && k === key)

    const base = {
      key,
      label: extra.label ?? defaultLabel(key),
      propertySchema: (extra.propertySchema as z.ZodTypeAny) ?? schema,
      propertyEditType,
      editable: editableGlobal && editableByProp && (extra.editable ?? true),
      clearable: extra.clearable,
    }

    if (extra.controlType === 'radio') {
      return {
        ...base,
        controlType: 'radio',
        options: extra.options,
        optionLabel: extra.optionLabel,
        optionValue: extra.optionValue,
      }
    }

    if (extra.controlType === 'select') {
      return {
        ...base,
        controlType: 'select',
        options: extra.options,
        optionLabel: extra.optionLabel,
        optionValue: extra.optionValue,
        multiple: extra.multiple,
      }
    }

    if (extra.controlType === 'checkbox' || extra.controlType === 'toggle') {
      return {
        ...base,
        controlType: extra.controlType,
        options: extra.options,
        optionLabel: extra.optionLabel,
        optionValue: extra.optionValue,
      }
    }

    if (propertyEditType === 'string' && extra.controlType === 'textarea') {
      return {
        ...base,
        controlType: 'textarea',
        rows: extra.rows,
      }
    }

    if (propertyEditType === 'string' && (!extra.controlType || extra.controlType === 'text')) {
      return {
        ...base,
        controlType: 'text',
      }
    }

    return base
  })
}
