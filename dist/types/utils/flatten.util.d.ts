import { type MaybeRefOrGetter } from 'vue';
import z from 'zod';
import type { ExtraPropertyOptions, PropertyEditControlType, PropertyEditType, PropertyKeyType } from '../types/form.type';
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
export declare function flattenSchema(schema: z.ZodTypeAny, prefix?: string): Record<string, z.ZodTypeAny>;
export declare function getNestedValue(obj: any, path: string): any;
export declare function setNestedValue<T extends object>(obj: MaybeRefOrGetter<T>, path: string, value: unknown): void;
type FormFieldMetaBase<K extends string = string> = {
    key: K;
    label: string;
    propertyEditType: PropertyEditType;
    propertySchema: z.ZodTypeAny;
    editable: boolean;
    clearable?: boolean;
};
type FormFieldMetaNoComponent<K extends string = string> = FormFieldMetaBase<K> & {
    controlType?: never;
    options?: never;
    optionLabel?: never;
    optionValue?: never;
    multiple?: never;
    rows?: never;
};
type FormFieldMetaText<K extends string = string> = FormFieldMetaBase<K> & {
    controlType?: 'text';
    rows?: never;
};
type FormFieldMetaTextarea<K extends string = string> = FormFieldMetaBase<K> & {
    controlType: 'textarea';
    rows?: number;
};
type FormFieldMetaSelect<K extends string = string> = FormFieldMetaBase<K> & {
    controlType: Extract<PropertyEditControlType, 'select'>;
    options: Record<string, unknown>[];
    optionLabel: string;
    optionValue: string;
    multiple?: boolean;
    rows?: never;
};
type FormFieldMetaToggleOrCheckbox<K extends string = string> = FormFieldMetaBase<K> & {
    controlType: Extract<PropertyEditControlType, 'toggle' | 'checkbox'>;
    options: Record<string, unknown>[];
    optionLabel: string;
    optionValue: string;
    multiple?: never;
    rows?: never;
};
type FormFieldMetaRadio<K extends string = string> = FormFieldMetaBase<K> & {
    controlType: Extract<PropertyEditControlType, 'radio'>;
    options: Record<string, unknown>[];
    optionLabel: string;
    optionValue: string;
    multiple?: never;
    rows?: never;
};
export type FormFieldMeta<K extends string = string> = FormFieldMetaNoComponent<K> | FormFieldMetaText<K> | FormFieldMetaTextarea<K> | FormFieldMetaSelect<K> | FormFieldMetaToggleOrCheckbox<K> | FormFieldMetaRadio<K>;
export declare function mapSchemaToFormFields<TSchema extends z.ZodTypeAny>(args: {
    schema: TSchema;
    editable?: boolean;
    editableProperties?: Array<PropertyKeyType<z.infer<TSchema>> | '*'>;
    extraPropertyOptions?: Partial<Record<PropertyKeyType<z.infer<TSchema>>, ExtraPropertyOptions>>;
    showProperties?: Array<PropertyKeyType<z.infer<TSchema>> | '*'>;
    hideProperties?: Array<PropertyKeyType<z.infer<TSchema>> | '*'>;
}): FormFieldMeta<PropertyKeyType<z.core.output<TSchema>>>[];
export {};
