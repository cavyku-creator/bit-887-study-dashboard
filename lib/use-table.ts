"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { getSupabaseClient } from "./supabase";
import type { RowByTable, TableName } from "./types";

type Filter = {
  column: string;
  value: string | boolean | number | null | undefined;
};

export function useTable<TName extends TableName>(
  table: TName,
  options: {
    filters?: Filter[];
    orderBy?: keyof RowByTable[TName] & string;
    ascending?: boolean;
  } = {}
) {
  const [rows, setRows] = useState<RowByTable[TName][]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = getSupabaseClient();

  const stableFilters = useMemo(() => options.filters ?? [], [options.filters]);
  const orderBy = options.orderBy ?? "created_at";
  const ascending = options.ascending ?? false;

  const load = useCallback(async () => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    setLoading(true);
    let query = supabase.from(table).select("*").order(orderBy, { ascending });
    for (const filter of stableFilters) {
      if (filter.value !== undefined && filter.value !== null && filter.value !== "") {
        query = query.eq(filter.column, filter.value);
      }
    }

    const { data, error: queryError } = await query;
    if (queryError) setError(queryError.message);
    else {
      setRows((data ?? []) as RowByTable[TName][]);
      setError(null);
    }
    setLoading(false);
  }, [ascending, orderBy, stableFilters, supabase, table]);

  useEffect(() => {
    void load();
  }, [load]);

  async function insert(payload: Partial<RowByTable[TName]>) {
    if (!supabase) return { error: "Supabase 未配置" };
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return { error: "请先登录" };

    const { error: mutationError } = await supabase.from(table).insert({ ...payload, user_id: userData.user.id } as never);
    if (mutationError) return { error: mutationError.message };
    await load();
    return { error: null };
  }

  async function update(id: string, payload: Partial<RowByTable[TName]>) {
    if (!supabase) return { error: "Supabase 未配置" };
    const { error: mutationError } = await supabase.from(table).update(payload as never).eq("id", id);
    if (mutationError) return { error: mutationError.message };
    await load();
    return { error: null };
  }

  async function remove(id: string) {
    if (!supabase) return { error: "Supabase 未配置" };
    const { error: mutationError } = await supabase.from(table).delete().eq("id", id);
    if (mutationError) return { error: mutationError.message };
    await load();
    return { error: null };
  }

  return { rows, loading, error, reload: load, insert, update, remove };
}
