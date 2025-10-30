import type { FormattersInitializer } from "typesafe-i18n";
import type { Formatters, Locales } from "./i18n-types.js";

export const initFormatters: FormattersInitializer<Locales, Formatters> = () => {
  const formatters: Formatters = {
    s: (value: unknown) => {
      const count = typeof value === "number" ? value : 0;
      return count === 1 ? "" : "s";
    },
  };

  return formatters;
};
