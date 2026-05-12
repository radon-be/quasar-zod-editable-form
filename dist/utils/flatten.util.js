import { toValue } from 'vue';
import z from 'zod';
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
export function flattenSchema(schema, prefix = '') {
    const flat = {};
    if (schema instanceof z.ZodObject) {
        for (const key in schema.shape) {
            const fieldSchema = schema.shape[key];
            const newKey = prefix ? `${prefix}.${key}` : key;
            // unwrap optional or nullable types
            const unwrapped = fieldSchema._def?.innerType || fieldSchema;
            if (unwrapped instanceof z.ZodObject) {
                Object.assign(flat, flattenSchema(unwrapped, newKey));
            }
            else {
                flat[newKey] = unwrapped;
            }
        }
    }
    return flat;
}
// safely get nested value
export function getNestedValue(obj, path) {
    return path.split('.').reduce((acc, key) => acc?.[key], obj);
}
// safely set nested value
export function setNestedValue(obj, path, value) {
    const keys = path.split('.');
    let curr = toValue(obj);
    keys.forEach((k, i) => {
        if (i === keys.length - 1) {
            curr[k] = value;
        }
        else {
            curr[k] = curr[k] ?? {};
            curr = curr[k];
        }
    });
}
function capitalize(value) {
    return value.charAt(0).toUpperCase() + value.slice(1);
}
function defaultLabel(path) {
    return capitalize(path.split('.').slice(-1)[0] ?? path);
}
function inferPropertyEditType(schema) {
    const unwrapped = schema?._def?.innerType ?? schema;
    if (unwrapped instanceof z.ZodBoolean)
        return 'boolean';
    if (unwrapped instanceof z.ZodEnum || unwrapped instanceof z.enum)
        return 'static-enum';
    if (unwrapped instanceof z.ZodNumber) {
        const checks = unwrapped?._def?.checks ?? [];
        const isInt = checks.some((c) => c.kind === 'int' || c.check === 'int');
        return isInt ? 'integer' : 'real';
    }
    if (unwrapped instanceof z.ZodString) {
        const checks = unwrapped?._def?.checks ?? [];
        if (checks.some((c) => c.kind === 'datetime' || c.format === 'datetime'))
            return 'date-time';
        if (checks.some((c) => c.kind === 'date' || c.format === 'date'))
            return 'date';
        if (checks.some((c) => c.kind === 'time' || c.format === 'time'))
            return 'time';
        return 'string';
    }
    return 'custom';
}
export function mapSchemaToFormFields(args) {
    const flat = flattenSchema(args.schema);
    const allKeys = Object.keys(flat);
    const show = args.showProperties;
    const hide = args.hideProperties;
    const allowAllVisible = !show || show.includes('*');
    const shownKeys = allowAllVisible ? allKeys : show.filter((k) => k !== '*' && k in flat);
    const hideSet = new Set((hide ?? []).filter((k) => k !== '*' && k in flat));
    const hideAll = !!hide?.includes('*');
    const keys = hideAll ? [] : shownKeys.filter((k) => !hideSet.has(k));
    const editableProps = args.editableProperties;
    const editableGlobal = args.editable ?? true;
    return keys.map((key) => {
        const schema = flat[key];
        const extra = args.extraPropertyOptions?.[key] ?? {};
        const propertyEditType = extra.propertyEditType ?? inferPropertyEditType(schema);
        const editableByProp = !editableProps || editableProps.includes('*') || editableProps.some((k) => k !== '*' && k === key);
        const base = {
            key,
            label: extra.label ?? defaultLabel(key),
            propertySchema: extra.propertySchema ?? schema,
            propertyEditType,
            editable: editableGlobal && editableByProp && (extra.editable ?? true),
            clearable: extra.clearable,
        };
        if (extra.controlType === 'radio') {
            return {
                ...base,
                controlType: 'radio',
                options: extra.options,
                optionLabel: extra.optionLabel,
                optionValue: extra.optionValue,
            };
        }
        if (extra.controlType === 'select') {
            return {
                ...base,
                controlType: 'select',
                options: extra.options,
                optionLabel: extra.optionLabel,
                optionValue: extra.optionValue,
                multiple: extra.multiple,
            };
        }
        if (extra.controlType === 'checkbox' || extra.controlType === 'toggle') {
            return {
                ...base,
                controlType: extra.controlType,
                options: extra.options,
                optionLabel: extra.optionLabel,
                optionValue: extra.optionValue,
            };
        }
        if (propertyEditType === 'string' && extra.controlType === 'textarea') {
            return {
                ...base,
                controlType: 'textarea',
                rows: extra.rows,
            };
        }
        if (propertyEditType === 'string' && (!extra.controlType || extra.controlType === 'text')) {
            return {
                ...base,
                controlType: 'text',
            };
        }
        return base;
    });
}
