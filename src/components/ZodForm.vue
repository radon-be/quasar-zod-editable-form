<template>
  <div class="rows q-gutter-sm">
    <template v-for="field in orderedFields" :key="field.key">
      <q-input
        v-if="field.propertyEditType === 'string' && field.controlType === 'text'"
        :model-value="getNestedValue(workingModel, field.key)"
        @update:model-value="(val) => updateField(field, val)"
        :disable="!field.editable"
        :label="field.label"
        :error="!!errors[field.key]"
        :error-message="errors[field.key]"
      />
      <q-input
        v-else-if="field.propertyEditType === 'string' && field.controlType === 'textarea'"
        :model-value="getNestedValue(workingModel, field.key)"
        @update:model-value="(val) => updateField(field, val)"
        :disable="!field.editable"
        :label="field.label"
        type="textarea"
        :rows="field.rows ?? 3"
        :error="!!errors[field.key]"
        :error-message="errors[field.key]"
      />
      <q-input
        v-else-if="field.propertyEditType === 'real' || field.propertyEditType === 'integer'"
        :model-value="getNestedValue(workingModel, field.key)"
        @update:model-value="(val) => updateField(field, val)"
        :label="field.label"
        :disable="!field.editable"
        :error="!!errors[field.key]"
        :error-message="errors[field.key]"
        type="number"
      />
      <q-checkbox
        v-else-if="field.propertyEditType === 'boolean'"
        :model-value="getNestedValue(workingModel, field.key)"
        @update:model-value="(val) => updateField(field, val)"
        :label="field.label"
        :disable="!field.editable"
        :error="!!errors[field.key]"
        :error-message="errors[field.key]"
      />
      <template v-else-if="field.propertyEditType === 'foreign-key' || field.propertyEditType === 'static-enum'">
        <q-select
          v-if="field.controlType === 'select'"
          :model-value="getNestedValue(workingModel, field.key)"
          @update:model-value="(val) => updateField(field, val)"
          :label="field.label"
          :disable="!field.editable"
          :options="field.options"
          :option-label="field.optionLabel"
          :option-value="field.optionValue"
          :multiple="field.multiple"
          :error="!!errors[field.key]"
          :error-message="errors[field.key]"
          emit-value
          map-options
          options-dense
        />
        <div
          v-else-if="
            field.controlType === 'checkbox' || field.controlType === 'toggle' || field.controlType === 'radio'
          "
        >
          <span v-if="field.label">{{ field.label }}</span>
          <q-option-group
            :type="field.controlType"
            :model-value="getNestedValue(workingModel, field.key)"
            @update:model-value="(val) => updateField(field, val)"
            :label="field.label"
            :disable="!field.editable"
            :options="field.options"
            :option-label="field.optionLabel"
            :option-value="field.optionValue"
            :error="!!errors[field.key]"
            :error-message="errors[field.key]"
          />
        </div>
      </template>
      <q-input
        v-else-if="['date', 'time', 'date-time'].includes(field.propertyEditType)"
        :model-value="
          date.formatDate(
            getNestedValue(workingModel, field.key),
            field.propertyEditType === 'date'
              ? 'DD-MM-YYYY'
              : field.propertyEditType === 'time'
                ? 'HH:mm'
                : 'DD-MM-YYYY HH:mm',
          )
        "
        :label="field.label"
        :disable="!field.editable"
        :error="!!errors[field.key]"
        :error-message="errors[field.key]"
        @click="field.editable ? popupRefs[field.key]?.show() : null"
      >
        <template #append>
          <q-popup-proxy
            :ref="(el: any) => (popupRefs[field.key] = el)"
            cover
            transition-show="scale"
            transition-hide="scale"
            @before-show="dateTimeStep = 'date'"
          >
            <component
              :is="getDateTimeType(field.propertyEditType) === 'date' ? QDate : QTime"
              v-model="dateOrTimeModel(field.key, getDateTimeType(field.propertyEditType)).value"
              v-bind="
                getDateTimeType(field.propertyEditType) === 'date' ? { firstDayOfWeek: '1' } : { format24h: true }
              "
              @update:model-value="
                field.propertyEditType === 'date-time' && dateTimeStep === 'date' ? (dateTimeStep = 'time') : null
              "
            >
              <div class="row items-center justify-between">
                <q-btn
                  :label="i18nLabels.datePickerNow"
                  color="primary"
                  flat
                  @click="() => (updateField(field, new Date().toISOString()), popupRefs[field.key]?.hide())"
                />
                <q-btn
                  :label="i18nLabels.datePickerClear"
                  color="primary"
                  flat
                  @click="() => (updateField(field, undefined), popupRefs[field.key]?.hide())"
                  v-if="typeof getNestedValue(workingModel, field.key) !== 'undefined'"
                />
                <q-btn
                  :label="i18nLabels.datePickerClose"
                  color="primary"
                  flat
                  @click.stop="popupRefs[field.key]?.hide()"
                />
              </div>
            </component>
          </q-popup-proxy>
          <q-icon name="event" @click.stop="field.editable ? popupRefs[field.key]?.show() : null" />
        </template>
      </q-input>
      <template v-else-if="field.propertyEditType === 'custom'">
        <slot
          :name="`field-${field.key}`"
          :field="field"
          :model-value="getNestedValue(workingModel, field.key)"
          :update-model-value="(val: unknown) => updateField(field, val)"
        />
      </template>
    </template>
    <div v-if="props.showActions !== false">
      <q-btn
        v-if="props.actions?.includes('confirm')"
        @click="handleConfirm"
        :label="i18nLabels.confirm"
        :disable="!props.editable || !isDirty"
      />
      <q-btn
        v-if="props.actions?.includes('reset')"
        @click="handleReset"
        :label="i18nLabels.reset"
        :disable="!props.editable || !isDirty"
      />
    </div>
  </div>
</template>

<script lang="ts" setup generic="TSchema extends z.ZodTypeAny">
import type z from 'zod'
import type { ExtraPropertyOptions, I18nLabels, PropertyEditType, PropertyKeyType } from '../types/form.type'
import { date, QBtn, QInput, QCheckbox, QSelect, QIcon, QDate, QTime, QPopupProxy, QOptionGroup } from 'quasar'
import { computed, ref, watch } from 'vue'
import { getNestedValue, setNestedValue, mapSchemaToFormFields, type FormFieldMeta } from '../utils/flatten.util'
import { useDateTimeModel } from '../composables/datetime-composables'
import { useZodFormI18n } from '../composables/useZodFormI18n'

defineOptions({
  inheritAttrs: false,
})

type PropertyValue<TSchema extends z.ZodTypeAny> = z.infer<TSchema>
type PropertyKey = PropertyKeyType<PropertyValue<TSchema>>

type FormOptions = {
  modelKey: PropertyKey
  schema: TSchema
  showProperties?: PropertyKey[] | ['*']
  hideProperties?: PropertyKey[] | ['*']
  editableProperties?: PropertyKey[] | ['*']
  editable?: boolean
  extraPropertyOptions?: Partial<Record<PropertyKey, ExtraPropertyOptions>>
  actions?: ('confirm' | 'reset')[]
  showActions?: boolean
  i18n?: Partial<I18nLabels>
  order?: PropertyKey[]
  onConfirm?: (model: PropertyValue<TSchema>) => Promise<boolean> | boolean
}

const props = withDefaults(defineProps<FormOptions>(), {
  editable: true,
  showActions: true,
  actions: () => ['confirm', 'reset'],
})

const defaultI18nLabels: I18nLabels = {
  confirm: 'Confirm',
  reset: 'Reset',
  datePickerNow: 'Now',
  datePickerClear: 'Clear',
  datePickerClose: 'Close',
}

const globalI18n = useZodFormI18n()
const i18nLabels = computed<I18nLabels>(() => ({
  ...defaultI18nLabels,
  ...(globalI18n?.value ?? {}),
  ...(props.i18n ?? {}),
}))

const model = defineModel<PropertyValue<TSchema>>({
  default: () => ({}) as PropertyValue<TSchema>,
})
const errors = defineModel<Partial<Record<PropertyKey, string>>>('errors', {
  default: () => ({}),
})

const workingModel = ref<PropertyValue<TSchema>>(props.schema.parse(model.value))
const popupRefs = ref<Record<string, InstanceType<typeof QPopupProxy> | null>>({})
const { dateOrTimeModel } = useDateTimeModel(workingModel)
const dateTimeStep = ref<'date' | 'time'>('date')

watch(
  () => model.value,
  (newVal) => {
    const parsed = props.schema.safeParse(newVal ?? {})
    if (parsed.success) workingModel.value = parsed.data
  },
  { deep: true },
)

const fields = computed(() =>
  mapSchemaToFormFields({
    schema: props.schema,
    editable: props.editable,
    editableProperties: props.editableProperties,
    extraPropertyOptions: props.extraPropertyOptions,
    showProperties: props.showProperties,
    hideProperties: props.hideProperties,
  }),
)

const orderedFields = computed(() => {
  const base = fields.value
  const order = props.order

  if (!order?.length) return base

  const byKey = new Map(base.map((f) => [f.key, f] as const))
  const used = new Set<PropertyKey>()
  const result: typeof base = []

  for (const key of order) {
    const field = byKey.get(key)
    if (!field) continue
    result.push(field)
    used.add(key)
  }

  for (const field of base) {
    if (!used.has(field.key)) result.push(field)
  }

  return result
})

const isDirty = computed(() => JSON.stringify(workingModel.value) !== JSON.stringify(model.value))

const coerceFieldValue = (fieldType: string, val: unknown) => {
  if (fieldType === 'integer') {
    if (val === '' || val == null) return undefined
    const n = Number.parseInt(String(val), 10)
    return Number.isNaN(n) ? val : n
  }
  if (fieldType === 'real') {
    if (val === '' || val == null) return undefined
    const n = Number(String(val))
    return Number.isNaN(n) ? val : n
  }
  return val
}

const updateField = (field: FormFieldMeta, val: unknown) => {
  const coercedValue = coerceFieldValue(field.propertyEditType, val)
  setNestedValue(workingModel.value, field.key, coercedValue)
  if (errors.value[field.key as PropertyKey]) {
    const updated = { ...errors.value }
    delete updated[field.key as PropertyKey]
    errors.value = updated
  }
}

const handleConfirm = async () => {
  const parsed = props.schema.safeParse(workingModel.value)
  if (!parsed.success) {
    const fieldErrors: Partial<Record<PropertyKey, string>> = {}
    for (const issue of parsed.error.issues) {
      const key = issue.path.join('.') as PropertyKey
      if (!fieldErrors[key]) fieldErrors[key] = issue.message
    }
    errors.value = fieldErrors
    return
  }

  const success = (await props.onConfirm?.(parsed.data)) ?? true
  if (success) model.value = parsed.data
}

const handleReset = () => {
  workingModel.value = props.schema.parse(model.value)
  errors.value = {}
}

const getDateTimeType = (propertyEditType: PropertyEditType) => {
  if (propertyEditType === 'date' || (propertyEditType === 'date-time' && dateTimeStep.value === 'date')) {
    return 'date'
  } else if (propertyEditType === 'time' || (propertyEditType === 'date-time' && dateTimeStep.value === 'time')) {
    return 'time'
  } else {
    return 'date'
  }
}

defineExpose<{
  confirm: () => void
  reset: () => void
  get isDirty(): boolean
}>({
  confirm: handleConfirm,
  reset: handleReset,
  get isDirty() {
    return isDirty.value
  },
})
</script>
