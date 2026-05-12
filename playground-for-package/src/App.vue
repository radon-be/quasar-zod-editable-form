<template>
  <div class="q-ma-md">
    <zod-form
      :schema="HealthcareProviderSchema"
      model-key="id"
      v-model="data"
      :errors="errors"
      :options="options"
      :on-confirm="handleOnConfirm"
      :extra-property-options="{
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
    />
  </div>
</template>

<script setup lang="ts">
import type { PropertyKeyType } from '@radon-be/quasar-app-extension-zod-form';
import {
  HealthcareProviderSchema,
  type HealthcareProvider,
} from 'app/schemas/healthcare-provider.schema';
import { ref } from 'vue';

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
});

const errors = ref<Partial<Record<PropertyKeyType<HealthcareProvider>, string>>>({});

const options = [
  { id: 'A', label: 'De Watermolen', address: 'Geneeskundestraat 13, 1000 Brussel' },
  { id: 'B', label: 'Het Botte Mes', address: 'Slachthuisstraat 12, 8500 Kortrijk' },
  { id: 'C', label: 'De Chirugrijn', address: 'Ziekenhuisweg 36, 8560 Marke' },
  { id: 'D', label: 'Het Labo', address: 'Pres. Kennedypark 2, 8500 Kortrijk' },
  { id: 'E', label: 'Bij De Beste Dokter', address: 'Dokterstraat 1, 9000 Gent' },
];

const handleOnConfirm = async (model: HealthcareProvider) => {
  errors.value = {};
  if (!model.firstName || model.firstName.trim().length === 0) {
    errors.value.firstName = 'Voornaam is verplicht!';
  }
  if (!model.name || model.name.trim().length === 0) {
    errors.value.name = 'Naam is verplicht!';
  }
  if (model.requestCounter > 150) {
    errors.value.requestCounter = 'Teller mag niet hoger zijn dan 150!';
  }

  return Promise.resolve(Object.values(errors.value).every((error) => !error));
};
</script>
