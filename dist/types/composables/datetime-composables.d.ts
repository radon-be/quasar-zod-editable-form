import { type Ref } from 'vue';
/** Computed writables for ISO datetime fields, bound to a single model ref */
export declare function useDateTimeModel<T extends object>(model: Ref<T>): {
    dateModel: (path: string) => import("vue").WritableComputedRef<string | null, string | null>;
    timeModel: (path: string) => import("vue").WritableComputedRef<string | null, string | null>;
    dateOrTimeModel: (path: string, kind: "date" | "time") => import("vue").WritableComputedRef<string | null, string | null>;
};
