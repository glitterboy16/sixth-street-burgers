"use client";

import { useSyncExternalStore } from "react";
import { schedule } from "@/data/site";
import { useLang } from "@/i18n/LangContext";

const noop = () => () => {};

/** Horario de hoy según el día en Canarias. En servidor y antes de hidratar muestra el tramo general. */
function todaySlot() {
  const weekday = new Intl.DateTimeFormat("en-US", { timeZone: "Atlantic/Canary", weekday: "short" }).format(
    new Date(),
  );
  const day = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(weekday);
  return schedule.find((s) => s.days.includes(day)) ?? schedule[0];
}

export default function TodayHours() {
  const { t } = useLang();
  const slot = useSyncExternalStore(noop, todaySlot, () => schedule[0]);
  return (
    <>
      {t.common.openToday} {slot.open}–{slot.close}
    </>
  );
}
