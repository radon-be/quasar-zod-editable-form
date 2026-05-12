import { provideZodFormI18n } from '@radon-be/quasar-app-extension-zod-form';
import { boot } from 'quasar/wrappers';
import { ref } from 'vue';

const i18nLabels = ref({
  confirm: 'Opslaan',
  reset: 'Annuleren',
  datePickerNow: 'Nu',
  datePickerClear: 'Wissen',
  datePickerClose: 'Sluiten',
});

export default boot(({ app }) => {
  provideZodFormI18n(i18nLabels, app);
});
