export default function (api) {
    api.extendQuasarConf((conf) => {
        conf.boot?.push('~@radon-be/quasar-app-extension-zod-form/dist/boot/register.js');
    });
}
