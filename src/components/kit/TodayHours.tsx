"use client";

import { useSyncExternalStore } from "react";
import { schedule, site } from "@/data/site";

const noop = () => () => {};

/** Horario de hoy según el día en Canarias. En servidor y antes de hidratar muestra el texto genérico. */
function todayText() {
  const weekday = new Intl.DateTimeFormat("en-US", { timeZone: "Atlantic/Canary", weekday: "short" }).format(
    new Date(),
  );
  const day = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(weekday);
  const slot = schedule.find((s) => s.days.includes(day));
  return slot ? `Abierto hoy ${slot.open}–${slot.close}` : site.todayHours;
}

export default function TodayHours() {
  const text = useSyncExternalStore(noop, todayText, () => site.todayHours);
  return <>{text}</>;
}
