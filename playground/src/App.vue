<template>
  <div class="row q-gutter-md q-pa-md">
    <div class="col q-pa-md" style="border: 1px solid #ccc">
      component:
      <ZodForm
        ref="zodFormRef"
        model-key="id"
        v-model="data"
        v-model:errors="errors"
        :schema="HealthcareProviderSchema"
        :on-confirm="handleOnConfirm"
        :show-properties="['*']"
        :editable-properties="[
          'extra.description',
          'firstName',
          'requestCounter',
          'office',
          'offices',
          'extra.requestedAt',
          'extra.requestedTime',
        ]"
        :hide-properties="['id']"
        :extra-property-options="{
          id: { propertyEditType: 'integer', editable: false },
          requestCounter: { label: 'Teller' },
          office: {
            propertyEditType: 'foreign-key',
            controlType: 'select',
            options,
            optionLabel: 'label',
            optionValue: 'id',
          },
          offices: {
            propertyEditType: 'foreign-key',
            controlType: 'checkbox',
            options,
            optionLabel: 'label',
            optionValue: 'id',
          },
          firstSeenAt: { propertyEditType: 'date' },
          'extra.requestedAt': { propertyEditType: 'date-time', label: 'Aangevraagd op' },
          'extra.requestedTime': { propertyEditType: 'time', label: 'Aangevraagd om' },
          'extra.description': { propertyEditType: 'string', controlType: 'textarea', rows: 4 },
          name: {
            propertyEditType: 'custom',
            label: 'Naam (custom slot)',
          },
        }"
        :actions="['confirm', 'reset']"
        :i18n="{
          confirm: 'Bijwerken',
          reset: 'Resetten',
        }"
        :order="['firstName', 'name', 'active', 'extra.description']"
      >
        <template v-slot:[`field-name`]="{ field, modelValue, updateModelValue }">
          <q-input
            :model-value="modelValue"
            @update:model-value="(val) => updateModelValue(val?.toString() || '')"
            :label="field.label"
            :disable="!field.editable"
          />
        </template>
      </ZodForm>
    </div>
    <div class="col q-pa-md" style="border: 1px solid #ccc">
      parent:
      <pre>{{ data }}</pre>
      <q-btn class="q-mt-md" label="Bijwerken" @click="handleConfirm" :disable="!zodFormRef?.isDirty" />
      <q-btn class="q-mt-md" label="Resetten" @click="zodFormRef?.reset()" :disable="!zodFormRef?.isDirty" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { QBtn, QInput } from 'quasar'
import { ref } from 'vue'
import ZodForm from '../../src/components/ZodForm.vue'
import type { PropertyKeyType } from '../../src/types/form.type'
import { HealthcareProviderSchema, type HealthcareProvider } from './schemas/healthcare-provider.schema'

const zodFormRef = ref<{ confirm: () => void; reset: () => void; isDirty: boolean } | null>(null)

const data = ref<HealthcareProvider>({
  id: 1,
  firstName: 'Dokter',
  name: 'Bibber',
  address: 'Marke',
  docType: 'dokter',
  office: 'A',
  offices: ['A'],
  requestCounter: 145,
  active: true,
  firstSeenAt: '2026-01-27T16:13:05.000Z',
  extra: {
    requestedAt: '2026-01-27T16:13:05.000Z',
    requestedTime: '2026-01-27T16:13:05.000Z',
    extraType: 'foo',
    description: 'Oostrozebeke',
  },
})

const errors = ref<Partial<Record<PropertyKeyType<HealthcareProvider>, string>>>({})

const options = [
  { id: 'A', label: 'De Watermolen', address: 'Geneeskundestraat 13, 1000 Brussel' },
  { id: 'B', label: 'Het Botte Mes', address: 'Slachthuisstraat 12, 8500 Kortrijk' },
  { id: 'C', label: 'De Chirugrijn', address: 'Ziekenhuisweg 36, 8560 Marke' },
  { id: 'D', label: 'Het Labo', address: 'Pres. Kennedypark 2, 8500 Kortrijk' },
  { id: 'E', label: 'Bij De Beste Dokter', address: 'Dokterstraat 1, 9000 Gent' },
]

const handleConfirm = () => {
  zodFormRef.value?.confirm()
}

const handleOnConfirm = async (model: HealthcareProvider) => {
  errors.value = {}
  if (!model.firstName || model.firstName.trim().length === 0) {
    errors.value.firstName = 'Voornaam is verplicht!'
  }
  if (!model.name || model.name.trim().length === 0) {
    errors.value.name = 'Naam is verplicht!'
  }
  if (model.requestCounter > 150) {
    errors.value.requestCounter = 'Teller mag niet hoger zijn dan 150!'
  }

  return Promise.resolve(Object.values(errors.value).every((error) => !error))
}
</script>
