"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { getSupabaseClient } from "./supabase";
import type { RowByTable, TableName } from "./types";

type FilterOperator = "eq" | "gte" | "lte" | "ilike";

type Filter = {
  column: string;
  op?: FilterOperator;
  value: unknown;
};

type UseTableOptions<TName extends TableName> = {
  filters?: Filter[];
  orderBy?: keyof RowByTable[TName] & string;
  ascending?: boolean;
  limit?: number;
  range?: { from: number; to: number };
  select?: string;
  upsert?: boolean;
};

type MutationResult<TRow> = { error: string | null; data?: TRow | null };

function applyFilter<TQuery>(query: TQuery, filter: Filter) {
  if (filter.value === undefined || filter.value === null || filter.value === "") return query;

  const builder = query as TQuery & Record<FilterOperator, (column: string, value: unknown) => TQuery>;
  const op = filter.op ?? "eq";
  return builder[op](filter.column, filter.value);
}

function friendlySupabaseError(message: string) {
  if (message.includes("schema cache") || message.includes("Could not find the table")) {
    return "数据库表尚未创建。请先在 Supabase 执行项目迁移，再刷新页面。";
  }
  return message;
}

export function useTable<TName extends TableName>(
  table: TName,
  options: UseTableOptions<TName> = {}
) {
  const [rows, setRows] = useState<RowByTable[TName][]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = getSupabaseClient();

  const filterKey = JSON.stringify(options.filters ?? []);
  const rangeKey = options.range ? `${options.range.from}:${options.range.to}` : "";
  const stableFilters = useMemo(() => JSON.parse(filterKey) as Filter[], [filterKey]);
  const orderBy = options.orderBy ?? "created_at";
  const ascending = options.ascending ?? false;
  const limit = options.limit;
  const range = useMemo(() => {
    if (!rangeKey) return undefined;
    const [from, to] = rangeKey.split(":").map(Number);
    return { from, to };
  }, [rangeKey]);
  const select = options.select ?? "*";
  const shouldUpsert = options.upsert ?? false;

  const load = useCallback(async () => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    setLoading(true);
    let query = supabase.from(table).select(select).order(orderBy, { ascending });
    for (const filter of stableFilters) {
      query = applyFilter(query, filter);
    }

    if (range) query = query.range(range.from, range.to);
    else if (limit !== undefined) query = query.limit(limit);

    const { data, error: queryError } = await query;
    if (queryError) setError(friendlySupabaseError(queryError.message));
    else {
      setRows((data ?? []) as unknown as RowByTable[TName][]);
      setError(null);
    }
    setLoading(false);
  }, [ascending, limit, orderBy, range, select, stableFilters, supabase, table]);

  useEffect(() => {
    void load();
  }, [load]);

  async function insert(payload: Partial<RowByTable[TName]>): Promise<MutationResult<RowByTable[TName]>> {
    if (!supabase) return { error: "Supabase 未配置" };
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return { error: "请先登录" };

    const row = { ...payload, user_id: userData.user.id };
    const mutation = shouldUpsert ? supabase.from(table).upsert(row as never) : supabase.from(table).insert(row as never);
    const { data, error: mutationError } = await mutation.select().single();
    if (mutationError) return { error: friendlySupabaseError(mutationError.message) };
    await load();
    return { error: null, data: data as unknown as RowByTable[TName] };
  }

  async function update(id: string, payload: Partial<RowByTable[TName]>): Promise<MutationResult<RowByTable[TName]>> {
    if (!supabase) return { error: "Supabase 未配置" };
    const { data, error: mutationError } = await supabase.from(table).update(payload as never).eq("id", id).select().single();
    if (mutationError) return { error: friendlySupabaseError(mutationError.message) };
    await load();
    return { error: null, data: data as unknown as RowByTable[TName] };
  }

  async function remove(id: string): Promise<MutationResult<null>> {
    if (!supabase) return { error: "Supabase 未配置" };
    const { error: mutationError } = await supabase.from(table).delete().eq("id", id);
    if (mutationError) return { error: friendlySupabaseError(mutationError.message) };
    await load();
    return { error: null };
  }

  return { rows, loading, error, reload: load, insert, update, remove };
}
