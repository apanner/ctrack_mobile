import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiJson, apiFetch } from './client';

export interface ExpenseReceipt {
  id: string;
  claim_id: string;
  s3_key: string;
  mime_type: string;
  file_name: string | null;
  file_size_bytes: number | null;
  created_at: string;
}

export interface ExpenseClaim {
  id: string;
  user_id: string;
  claim_date: string;
  category: string;
  amount: number;
  currency: string;
  project_id: string | null;
  shot_id: string | null;
  notes: string | null;
  status: 'Draft' | 'Submitted' | 'Under Review' | 'Approved' | 'Rejected' | 'Paid';
  submitted_at: string | null;
  created_at: string;
  updated_at: string;
  expense_receipts?: ExpenseReceipt[];
  expense_approvals?: unknown[];
}

export interface ExpensesResponse {
  data: ExpenseClaim[];
}

export interface CreateExpenseInput {
  claimDate: string;
  category: string;
  amount: number;
  currency?: string;
  projectId?: string | null;
  notes?: string | null;
}

export interface UploadUrlResponse {
  uploadUrl: string;
  s3Key: string;
}

async function fetchExpenses(params?: { status?: string; limit?: number }): Promise<ExpenseClaim[]> {
  const search = new URLSearchParams();
  if (params?.status) search.set('status', params.status);
  if (params?.limit) search.set('limit', String(params.limit));
  const qs = search.toString();
  const res = await apiJson<ExpensesResponse>(`/api/v1/mobile/expenses${qs ? `?${qs}` : ''}`);
  return (res as ExpensesResponse).data ?? [];
}

async function createExpense(input: CreateExpenseInput): Promise<ExpenseClaim> {
  const res = await apiJson<{ data: ExpenseClaim }>('/api/v1/mobile/expenses', {
    method: 'POST',
    body: JSON.stringify({
      claimDate: input.claimDate,
      category: input.category,
      amount: input.amount,
      currency: input.currency ?? 'INR',
      projectId: input.projectId ?? null,
      notes: input.notes ?? null,
    }),
  });
  return (res as { data: ExpenseClaim }).data;
}

async function submitExpense(claimId: string): Promise<ExpenseClaim> {
  const res = await apiJson<{ data: ExpenseClaim }>(
    `/api/v1/mobile/expenses/${claimId}/submit`,
    { method: 'POST' }
  );
  return (res as { data: ExpenseClaim }).data;
}

async function getUploadUrl(claimId: string, fileName: string, mimeType: string): Promise<UploadUrlResponse> {
  const res = await apiJson<UploadUrlResponse>('/api/v1/mobile/expenses/upload-url', {
    method: 'POST',
    body: JSON.stringify({ claimId, fileName, mimeType }),
  });
  return res;
}

export function useExpenses(params?: { status?: string; limit?: number }) {
  return useQuery({
    queryKey: ['expenses', params],
    queryFn: () => fetchExpenses(params),
  });
}

export function useSubmitExpense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createExpense,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
    },
  });
}

export function useSubmitExpenseClaim() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: submitExpense,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
    },
  });
}

export function useExpenseUploadUrl() {
  return useMutation({
    mutationFn: ({ claimId, fileName, mimeType }: { claimId: string; fileName: string; mimeType: string }) =>
      getUploadUrl(claimId, fileName, mimeType),
  });
}

/**
 * Upload a file buffer to presigned S3 URL.
 */
export async function uploadToPresignedUrl(
  uploadUrl: string,
  body: ArrayBuffer | Blob,
  mimeType: string
): Promise<void> {
  const res = await fetch(uploadUrl, {
    method: 'PUT',
    body,
    headers: { 'Content-Type': mimeType },
  });
  if (!res.ok) {
    throw new Error(`Upload failed: ${res.status} ${res.statusText}`);
  }
}
