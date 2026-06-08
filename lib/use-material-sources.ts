"use client";

import { useMemo } from "react";
import { getSupabaseClient } from "./supabase";
import { useTable } from "./use-table";
import type { MaterialSource, KnowledgeSubject } from "./types";

export const MATERIALS_PRIVATE_BUCKET = "study-materials-private";

export type MaterialSourceDraft = Pick<MaterialSource, "source_kind" | "subject" | "title"> &
  Partial<
    Pick<
      MaterialSource,
      | "source_label"
      | "source_url"
      | "storage_bucket"
      | "storage_path"
      | "file_mime_type"
      | "file_size_bytes"
      | "ocr_status"
      | "ocr_text"
      | "copyright_scope"
      | "is_private"
      | "metadata"
    >
  >;

export function useMaterialSources(options: { subject?: KnowledgeSubject | "all"; ocrStatus?: MaterialSource["ocr_status"] | "all"; limit?: number } = {}) {
  const filters = useMemo(
    () => [
      { column: "subject", value: options.subject === "all" ? "" : options.subject ?? "" },
      { column: "ocr_status", value: options.ocrStatus === "all" ? "" : options.ocrStatus ?? "" }
    ],
    [options.ocrStatus, options.subject]
  );

  const table = useTable("material_sources", {
    filters,
    orderBy: "created_at",
    ascending: false,
    limit: options.limit
  });

  async function addMaterialSource(payload: MaterialSourceDraft) {
    return table.insert({
      ...payload,
      source_label: payload.source_label ?? null,
      source_url: payload.source_url ?? null,
      storage_bucket: payload.storage_bucket ?? null,
      storage_path: payload.storage_path ?? null,
      file_mime_type: payload.file_mime_type ?? null,
      file_size_bytes: payload.file_size_bytes ?? null,
      ocr_status: payload.ocr_status ?? (payload.ocr_text ? "done" : "not_needed"),
      ocr_text: payload.ocr_text ?? null,
      copyright_scope: payload.copyright_scope ?? "private_notes_only",
      is_private: payload.is_private ?? true,
      metadata: payload.metadata ?? {}
    });
  }

  async function updateOcrText(id: string, ocrText: string) {
    return table.update(id, {
      ocr_text: ocrText,
      ocr_status: ocrText.trim() ? "done" : "pending"
    });
  }

  async function uploadPrivateAttachment(file: File, pathPrefix = "") {
    const supabase = getSupabaseClient();
    if (!supabase) return { data: null, error: "Supabase 未配置" };

    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return { data: null, error: "请先登录" };

    const safeName = file.name.replace(/[^a-zA-Z0-9._-]+/g, "-");
    const storagePath = [userData.user.id, pathPrefix, `${Date.now()}-${safeName}`].filter(Boolean).join("/");
    const { data, error } = await supabase.storage.from(MATERIALS_PRIVATE_BUCKET).upload(storagePath, file, {
      upsert: false
    });

    return { data, error: error?.message ?? null };
  }

  return {
    ...table,
    addMaterialSource,
    updateOcrText,
    uploadPrivateAttachment
  };
}
