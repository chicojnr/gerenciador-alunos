import { useCallback, useEffect, useState } from "react";
import { calendariosLetivosService } from "../services/calendarios-letivos.service.js";
import type {
  CalendarioLetivo,
  CreateCalendarioLetivoInput,
  UpdateCalendarioLetivoInput
} from "../types.js";

export function useCalendariosLetivos() {
  const [calendarios, setCalendarios] = useState<CalendarioLetivo[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    const { items } = await calendariosLetivosService.list();
    setCalendarios(items);
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  async function create(data: CreateCalendarioLetivoInput) {
    await calendariosLetivosService.create(data);
    await refresh();
  }

  async function update(id: string, data: UpdateCalendarioLetivoInput) {
    await calendariosLetivosService.update(id, data);
    await refresh();
  }

  async function remove(id: string) {
    await calendariosLetivosService.remove(id);
    await refresh();
  }

  return { calendarios, loading, create, update, remove };
}
