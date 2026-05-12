import type z from 'zod'
import type { FlattenKeys, FlattenObjectKeys } from './flatten.type'

export type PropertyKeyType<T> = T extends z.ZodRawShape
  ? FlattenKeys<T>
  : T extends Record<string, any>
    ? FlattenObjectKeys<T>
    : never

export type PropertyEditType =
  | 'string'
  | 'integer'
  | 'real'
  | 'static-enum'
  | 'foreign-key'
  | 'boolean'
  | 'date'
  | 'time'
  | 'date-time'
  | 'custom'
export type PropertyEditControlType = 'select' | 'checkbox' | 'toggle' | 'radio' | 'text' | 'textarea'

export type ExtraPropertyOptionsBase = {
  propertyEditType?: PropertyEditType
  label?: string
  propertySchema?: z.ZodType
  editable?: boolean
  clearable?: boolean
}

export type ExtraPropertyOptionsTextInput = ExtraPropertyOptionsBase & {
  propertyEditType: 'string'
  controlType?: 'text'
}

export type ExtraPropertyOptionsTextarea = ExtraPropertyOptionsBase & {
  propertyEditType: 'string'
  controlType: 'textarea'
  rows?: number
}

export type ExtraPropertyOptionSelectLike = {
  label: string
  id: string | number
  [key: string]: unknown
}

export type ExtraPropertyOptionsSelect<T extends ExtraPropertyOptionSelectLike> = ExtraPropertyOptionsBase & {
  controlType: Extract<PropertyEditControlType, 'select'>
  options: T[]
  optionLabel: keyof T & string
  optionValue: keyof T & string
  multiple?: boolean
}

export type ExtraPropertyOptionsToggleOrCheckbox<T extends ExtraPropertyOptionSelectLike> = ExtraPropertyOptionsBase & {
  controlType: Extract<PropertyEditControlType, 'toggle' | 'checkbox'>
  options: T[]
  optionLabel: keyof T & string
  optionValue: keyof T & string
  multiple?: never
}

export type ExtraPropertyOptionsRadio<T extends ExtraPropertyOptionSelectLike> = ExtraPropertyOptionsBase & {
  controlType: Extract<PropertyEditControlType, 'radio'>
  options: T[]
  optionLabel: keyof T & string
  optionValue: keyof T & string
  multiple?: never
}

export type ExtraPropertyOptionsNoComponent = ExtraPropertyOptionsBase & {
  controlType?: never
  options?: never
  optionLabel?: never
  optionValue?: never
}

export type ExtraPropertyOptions<T extends ExtraPropertyOptionSelectLike = ExtraPropertyOptionSelectLike> =
  | ExtraPropertyOptionsNoComponent
  | ExtraPropertyOptionsTextInput
  | ExtraPropertyOptionsTextarea
  | ExtraPropertyOptionsSelect<T>
  | ExtraPropertyOptionsToggleOrCheckbox<T>
  | ExtraPropertyOptionsRadio<T>

export type I18nLabels = {
  confirm: string
  reset: string
  datePickerNow: string
  datePickerClear: string
  datePickerClose: string
}
