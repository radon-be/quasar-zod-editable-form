import { type ZodForm as ZodFormComponent } from '@radon-be/quasar-app-extension-zod-form';

declare module '@vue/runtime-core' {
  export interface GlobalComponents {
    ZodForm: typeof ZodFormComponent;
  }
}

export {};
