import type { IndexAPI } from '@quasar/app-vite'

export default function (api: IndexAPI) {
  api.extendQuasarConf((conf) => {
    conf.boot?.push('~@radon-be/quasar-app-extension-zod-form/dist/boot/register.js')
  })
}
