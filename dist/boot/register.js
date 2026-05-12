import { boot } from 'quasar/wrappers';
import ZodForm from '../components/ZodForm.vue';
export default boot(({ app }) => {
    app.component('ZodForm', ZodForm);
});
