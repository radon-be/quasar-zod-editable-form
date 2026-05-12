import { type InjectionKey, type Ref, type App } from 'vue';
import type { I18nLabels } from '../types/form.type';
export declare const ZodFormI18nKey: InjectionKey<Ref<Partial<I18nLabels>>>;
/**
 * Provide global i18n labels for all ZodForm instances.
 *
 * - In a **Quasar CLI boot file**: call this directly (runs inside app plugin context).
 * - In a **plain Vite/Vue app**: pass the `app` instance so it uses `app.provide()`.
 *
 * @example Boot file (Quasar CLI)
 * export default boot(() => {
 *   provideZodFormI18n(ref({ confirm: 'Opslaan', reset: 'Annuleren' }))
 * })
 *
 * @example main.ts (plain Vite)
 * app.use(createZodFormI18nPlugin(ref({ confirm: 'Opslaan', reset: 'Annuleren' })))
 */
export declare function provideZodFormI18n(i18n: Ref<Partial<I18nLabels>>, app?: App): void;
/**
 * Creates a Vue plugin that globally provides i18n labels for all ZodForm instances.
 * Use this in plain Vite/Vue apps where there is no boot file.
 *
 * @example main.ts
 * import { ref } from 'vue'
 * import { createZodFormI18nPlugin } from '@radon-be/quasar-app-extension-zod-form'
 *
 * app.use(createZodFormI18nPlugin(ref({ confirm: 'Opslaan', reset: 'Annuleren' })))
 */
export declare function createZodFormI18nPlugin(i18n: Ref<Partial<I18nLabels>>): {
    install(app: App): void;
};
/**
 * Get the global i18n labels for ZodForm.
 * Used internally by the ZodForm component.
 *
 * Returns the provided global i18n ref, or null if not provided.
 */
export declare function useZodFormI18n(): Ref<Partial<I18nLabels>> | null;
