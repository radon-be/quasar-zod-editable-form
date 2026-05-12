import { computed, type Ref } from 'vue'
import { date } from 'quasar'
import { getNestedValue, setNestedValue } from '../utils/flatten.util'

/** Computed writables for ISO datetime fields, bound to a single model ref */
export function useDateTimeModel<T extends object>(model: Ref<T>) {
  const timeModel = (path: string) =>
    computed<string | null>({
      get: () => {
        const nested = getNestedValue(model.value, path)
        if (!nested) return null
        return date.formatDate(nested, 'HH:mm')
      },
      set: (newValue) => {
        if (!newValue) return
        const [hh, mm] = newValue.split(':').map(Number)

        const nested = getNestedValue(model.value, path)
        const baseDate = nested ? new Date(nested) : new Date()

        const next = new Date(baseDate)
        next.setHours(hh, mm, 0, 0)

        setNestedValue(model.value, path, next.toISOString())
      },
    })

  const dateModel = (path: string) =>
    computed<string | null>({
      get: () => {
        const nested = getNestedValue(model.value, path)
        if (!nested || String(nested).length === 0) return null
        return date.formatDate(nested, 'YYYY/MM/DD')
      },
      set: (newValue) => {
        if (!newValue) return
        const [year, month, day] = newValue.split('/').map(Number)
        const next = new Date(year, month - 1, day)
        setNestedValue(model.value, path, next.toISOString())
      },
    })

  const dateOrTimeModel = (path: string, kind: 'date' | 'time') =>
    kind === 'date' ? dateModel(path) : timeModel(path)

  return {
    dateModel,
    timeModel,
    dateOrTimeModel,
  }
}