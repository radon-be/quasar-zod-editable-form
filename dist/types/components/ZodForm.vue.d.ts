import type z from 'zod';
import type { ExtraPropertyOptions, I18nLabels, PropertyKeyType } from '../types/form.type';
import { type FormFieldMeta } from '../utils/flatten.util';
declare const __VLS_export: <TSchema extends z.ZodTypeAny>(__VLS_props: NonNullable<Awaited<typeof __VLS_setup>>["props"], __VLS_ctx?: __VLS_PrettifyLocal<Pick<NonNullable<Awaited<typeof __VLS_setup>>, "attrs" | "emit" | "slots">>, __VLS_exposed?: NonNullable<Awaited<typeof __VLS_setup>>["expose"], __VLS_setup?: Promise<{
    props: import("vue").PublicProps & __VLS_PrettifyLocal<({
        modelKey: PropertyKeyType<z.core.output<TSchema>>;
        schema: TSchema;
        showProperties?: PropertyKeyType<z.core.output<TSchema>>[] | ["*"];
        hideProperties?: PropertyKeyType<z.core.output<TSchema>>[] | ["*"];
        editableProperties?: PropertyKeyType<z.core.output<TSchema>>[] | ["*"];
        editable?: boolean;
        extraPropertyOptions?: Partial<Record<PropertyKeyType<z.core.output<TSchema>>, ExtraPropertyOptions>>;
        actions?: ("confirm" | "reset")[];
        showActions?: boolean;
        i18n?: Partial<I18nLabels>;
        order?: PropertyKeyType<z.core.output<TSchema>>[];
        onConfirm?: (model: z.core.output<TSchema>) => Promise<boolean> | boolean;
    } & {
        modelValue?: z.core.output<TSchema>;
        errors?: Partial<Record<PropertyKeyType<z.core.output<TSchema>>, string>>;
    }) & {
        "onUpdate:modelValue"?: ((value: z.core.output<TSchema>) => any) | undefined;
        "onUpdate:errors"?: ((value: Partial<Record<PropertyKeyType<z.core.output<TSchema>>, string>>) => any) | undefined;
    }> & (typeof globalThis extends {
        __VLS_PROPS_FALLBACK: infer P;
    } ? P : {});
    expose: (exposed: import("vue").ShallowUnwrapRef<{
        confirm: () => void;
        reset: () => void;
        readonly isDirty: boolean;
    }>) => void;
    attrs: any;
    slots: { [K in `field-${PropertyKeyType<z.core.output<TSchema>>}`]?: ((props: {
        field: FormFieldMeta<PropertyKeyType<z.core.output<TSchema>>>;
        modelValue: any;
        updateModelValue: (val: unknown) => void;
    }) => any) | undefined; };
    emit: ((event: "update:modelValue", value: z.core.output<TSchema>) => void) & ((event: "update:errors", value: Partial<Record<PropertyKeyType<z.core.output<TSchema>>, string>>) => void);
}>) => import("vue").VNode & {
    __ctx?: Awaited<typeof __VLS_setup>;
};
declare const _default: typeof __VLS_export;
export default _default;
type __VLS_PrettifyLocal<T> = (T extends any ? {
    [K in keyof T]: T[K];
} : {
    [K in keyof T as K]: T[K];
}) & {};
