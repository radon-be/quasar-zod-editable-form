# Quasar App Extension Zod Form

A schema-driven Quasar form component for Vue 3 that builds inputs from a Zod v4 schema.

## Install

Install the package:

```bash
npm install @radon-be/quasar-app-extension-zod-form
```

Optional (when consumed as a Quasar app extension):

```bash
quasar ext add @radon-be/zod-form
```

### Requirements

- Quasar v2.18+
- Vue v3.5+
- Zod v4

## Features

- **Strongly typed** model and `v-model:errors` keys inferred from your Zod schema
- **Schema Driven**: form fields are generated automatically from the schema shape
- **Validation**: built-in Zod validation with field-level error mapping
- **Nested properties**: dot notation support such as `extra.requestedAt`
- **Type-aware controls**: `string`, `integer`, `real`, `boolean`, `static-enum`, `foreign-key`, `date`, `time`, `date-time`
- **Flexible controls**: `select`, `checkbox`, `toggle`, `radio`, `text`, and `textarea`
- **Custom rendering**: dynamic slots via `field-{propertyKey}` for full UI control
- **Configurable behavior** through `show-properties`, `hide-properties`, `editable-properties`, and `order`
- **Exposed API** with `confirm()`, `reset()`, and `isDirty`

### IntelliSense

For TypeScript prop IntelliSense in Vue templates, make sure Volar is enabled.

You can use the component in two ways:

- As a global component via Quasar boot registration
- As a named import:

```ts
import { ZodForm } from '@radon-be/quasar-app-extension-zod-form'
```

#### Global Component IntelliSense (Quasar project)

When using the component globally, augment Vue runtime-core in src/env.d.ts:

```ts
import { type ZodForm as ZodFormComponent } from '@radon-be/quasar-app-extension-zod-form'

declare module '@vue/runtime-core' {
  export interface GlobalComponents {
    ZodForm: typeof ZodFormComponent
  }
}

export {}
```

## Usage

```vue
<template>
  <ZodForm
    ref="zodFormRef"
    model-key="id"
    v-model="model"
    v-model:errors="errors"
    :schema="userSchema"
    :show-properties="['*']"
    :editable-properties="['*']"
    :hide-properties="['id']"
    :order="['firstName', 'name', 'active']"
    :extra-property-options="{
      role: {
        propertyEditType: 'static-enum',
        controlType: 'select',
        options: [
          { id: 'admin', label: 'Admin' },
          { id: 'user', label: 'User' },
        ],
        optionLabel: 'label',
        optionValue: 'id',
      },
      notes: {
        propertyEditType: 'string',
        controlType: 'textarea',
        rows: 4,
      },
      requestedAt: {
        propertyEditType: 'date-time',
      },
    }"
    :actions="['confirm', 'reset']"
    :on-confirm="handleConfirm"
  >
    <template #field-name="{ field, modelValue, updateModelValue }">
      <q-input
        :model-value="modelValue"
        :label="field.label"
        @update:model-value="(val) => updateModelValue(val?.toString() || '')"
      />
    </template>
  </ZodForm>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { z } from 'zod'

const userSchema = z.object({
  id: z.number().readonly(),
  firstName: z.string().min(1, 'First name is required'),
  name: z.string().min(1, 'Name is required'),
  role: z.enum(['admin', 'user']),
  active: z.boolean(),
  requestedAt: z.string().datetime().optional(),
  notes: z.string().optional(),
})

type User = z.infer<typeof userSchema>

const model = ref<User>({
  id: 1,
  firstName: 'Alice',
  name: 'Johnson',
  role: 'admin',
  active: true,
  requestedAt: new Date().toISOString(),
  notes: '',
})

const errors = ref<Partial<Record<keyof User, string>>>({})

const handleConfirm = async (validated: User) => {
  console.log('confirmed', validated)
  return true
}
</script>
```

## Props

| Prop                     | Type                                        | Description                                                                             |
| ------------------------ | ------------------------------------------- | --------------------------------------------------------------------------------------- |
| `model-key`              | `PropertyKey`                               | **Required** unique identifier property for the model.                                  |
| `schema`                 | `ZodType`                                   | **Required** Zod schema used for field generation and validation.                       |
| `model-value`            | `Object`                                    | Two-way bound model via `v-model`.                                                      |
| `errors`                 | `Object`                                    | Two-way bound field errors via `v-model:errors`.                                        |
| `show-properties`        | `PropertyKey[] \| ['*']`                    | Only render the specified properties. Use `['*']` to show all.                          |
| `hide-properties`        | `PropertyKey[] \| ['*']`                    | Hide specified properties from rendering.                                               |
| `editable-properties`    | `PropertyKey[] \| ['*']`                    | Limit editability to selected properties.                                               |
| `editable`               | `boolean`                                   | Global edit mode switch. Default: `true`.                                               |
| `extra-property-options` | `Record<PropertyKey, ExtraPropertyOptions>` | Per-field overrides for editor type, control, labels, options, and behavior.            |
| `actions`                | `('confirm' \| 'reset')[]`                  | Enables action buttons. Default: `['confirm', 'reset']`.                                |
| `show-actions`           | `boolean`                                   | Shows or hides the action button row. Default: `true`.                                  |
| `i18n`                   | `Partial<I18nLabels>`                       | Override labels for actions and date/time picker buttons.                               |
| `order`                  | `PropertyKey[]`                             | Preferred property order. Unlisted visible properties are appended.                     |
| `on-confirm`             | `(model) => Promise<boolean> \| boolean`    | Callback after successful validation; model is committed only when this returns `true`. |

### Extra Property Options

Use `extra-property-options` to override field behavior with explicit control over editor type and UI.

- **Type override** via `propertyEditType`: `string`, `integer`, `real`, `static-enum`, `foreign-key`, `boolean`, `date`, `time`, `date-time`, `custom`
- **Control override** via `controlType`: `select`, `checkbox`, `toggle`, `radio`, `text`, `textarea`
- **Presentation settings**: `label`, `editable`, `clearable`, `rows`
- **Selection settings**: `options`, `optionLabel`, `optionValue`, `multiple`

## Internationalization (i18n)

`ZodForm` includes default labels in English. You can customize them globally for your entire app or per-instance using the `i18n` prop.

Labels are resolved using a three-layer merge — in increasing priority:

1. **Built-in defaults** (English)
2. **Global labels** provided via `provideZodFormI18n` or `createZodFormI18nPlugin`
3. **Per-instance labels** via the `i18n` prop

### Global i18n Setup (Recommended)

For the best experience, set up i18n globally so all `ZodForm` instances use the same language without passing props:

**Create a boot file** `src/boot/zodForm-i18n.ts`:

```typescript
import { boot } from 'quasar/wrappers'
import { ref } from 'vue'
import { provideZodFormI18n, type I18nLabels } from '@radon-be/quasar-app-extension-zod-form'

export const i18nLabels = ref<Partial<I18nLabels>>({
  confirm: 'Confirm',
  reset: 'Reset',
  // ... other overrides
})

export default boot(({ app }) => {
  provideZodFormI18n(i18nLabels, app)
})
```

**Register the boot file** in `quasar.config.ts`:

```typescript
boot: ['zodForm-i18n']
```

### Per-Component i18n Override

Prop overrides take precedence over global settings:

```vue
<ZodForm :schema="schema" model-key="id" :i18n="{ confirm: 'Save' }" />
```

### Dynamic Language Switching

Change language at runtime by updating the exported ref:

```typescript
// In a language switcher component
import { i18nLabels } from 'boot/zodForm-i18n'

function switchToDutch() {
  i18nLabels.value = {
    confirm: 'Opslaan',
    reset: 'Annuleren',
    datePickerNow: 'Nu',
    datePickerClear: 'Wissen',
    datePickerClose: 'Sluiten',
  }
}
```

### Plain Vite/Vue Apps

For apps without a Quasar CLI boot file, use `createZodFormI18nPlugin()` in `main.ts`:

```typescript
import { ref } from 'vue'
import { createZodFormI18nPlugin } from '@radon-be/quasar-app-extension-zod-form'

app.use(
  createZodFormI18nPlugin(
    ref({
      confirm: 'Confirm',
      reset: 'Reset',
    }),
  ),
)
```

### Available i18n Labels

| Key               | Default   | Description                     |
| ----------------- | --------- | ------------------------------- |
| `confirm`         | `Confirm` | Confirm/submit button label     |
| `reset`           | `Reset`   | Reset button label              |
| `datePickerNow`   | `Now`     | Date picker "set to now" button |
| `datePickerClear` | `Clear`   | Date picker clear button        |
| `datePickerClose` | `Close`   | Date picker close button        |

### Dutch Example

```typescript
// src/boot/zodForm-i18n.ts
import { boot } from 'quasar/wrappers'
import { ref } from 'vue'
import { provideZodFormI18n } from '@radon-be/quasar-app-extension-zod-form'

const i18nLabels = ref({
  confirm: 'Opslaan',
  reset: 'Annuleren',
  datePickerNow: 'Nu',
  datePickerClear: 'Wissen',
  datePickerClose: 'Sluiten',
})

export default boot(({ app }) => {
  provideZodFormI18n(i18nLabels, app)
})
```

### Spanish Example

```typescript
const i18nLabels = ref({
  confirm: 'Guardar',
  reset: 'Restablecer',
  datePickerNow: 'Ahora',
  datePickerClear: 'Limpiar',
  datePickerClose: 'Cerrar',
})
```

## Slots

Use dynamic field slots to fully customize rendering for a specific property.

- **Slot name**: `field-{propertyKey}`
- **Examples**: `field-name`, `field-extra.description`

Slot props:

- `field`: field metadata object
- `modelValue`: current field value
- `updateModelValue`: callback to update the field value in the working model

## Exposed API

The component exposes methods and state through `ref`:

- `confirm()`: validates and commits data to `v-model` when successful
- `reset()`: resets working data and clears `errors`
- `isDirty`: `true` when working model differs from the bound model

## Validation Flow

1. **Edit phase**: user changes values in an internal working model.
2. **Validation phase**: `confirm()` calls `schema.safeParse(...)`.
3. **Error mapping**: Zod issues are mapped into `v-model:errors`.
4. **Confirm callback**: `on-confirm` runs after successful parsing.
5. **Commit phase**: `v-model` updates only when `on-confirm` returns `true` (or is not provided).

## Build

Package build:

```bash
npm run build
```

Create local tarball for testing:

```bash
npm run pack:local
```
