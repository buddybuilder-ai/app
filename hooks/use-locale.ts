"use client"

import { useCallback, useMemo } from "react"
import { useUIStore } from "@/stores/ui-store"
import en from "@/i18n/locales/en.json"
import th from "@/i18n/locales/th.json"

const messages: Record<string, typeof en> = { en, th }

type NestedKeyOf<T, Prefix extends string = ""> = T extends object
  ? {
      [K in keyof T & string]: T[K] extends object
        ? NestedKeyOf<T[K], `${Prefix}${K}.`>
        : `${Prefix}${K}`
    }[keyof T & string]
  : never

type TranslationKey = NestedKeyOf<typeof en>

export function useLocale() {
  const locale = useUIStore((s) => s.locale)
  const setLocale = useUIStore((s) => s.setLocale)

  const t = useCallback(
    (key: TranslationKey): string => {
      const dict = messages[locale] ?? messages.en
      const keys = key.split(".")
      let result: unknown = dict

      for (const k of keys) {
        if (result && typeof result === "object" && k in result) {
          result = (result as Record<string, unknown>)[k]
        } else {
          return key
        }
      }

      return typeof result === "string" ? result : key
    },
    [locale]
  )

  return useMemo(
    () => ({ locale, setLocale, t }),
    [locale, setLocale, t]
  )
}
