/**
 * Chat media helpers: upload image/audio to S3 via presigned URL, get signed URLs.
 */
import * as FileSystem from 'expo-file-system';
import { apiJson } from './client';
import { uploadToPresignedUrl } from './expenses';

export async function uriToBlob(uri: string, mimeType: string): Promise<Blob> {
  const base64 = await FileSystem.readAsStringAsync(uri, {
    encoding: FileSystem.EncodingType.Base64,
  });
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return new Blob([bytes], { type: mimeType });
}

const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5MB
const MAX_AUDIO_SECONDS = 120; // 2 min

export interface ChatUploadUrlResponse {
  uploadUrl: string;
  attachmentId: string;
}

export interface ChatAttachmentUrlResponse {
  url: string;
}

async function getUploadUrl(params: {
  roomId: string;
  mimeType: string;
  fileName: string;
  messageType: 'image' | 'audio';
  durationSeconds?: number;
  fileSizeBytes?: number;
}): Promise<ChatUploadUrlResponse> {
  const res = await apiJson<ChatUploadUrlResponse>('/api/v1/mobile/chat/upload-url', {
    method: 'POST',
    body: JSON.stringify({
      roomId: params.roomId,
      mimeType: params.mimeType,
      fileName: params.fileName,
      messageType: params.messageType,
      durationSeconds: params.durationSeconds,
      fileSizeBytes: params.fileSizeBytes,
    }),
  });
  return res;
}

export async function getAttachmentUrl(attachmentId: string): Promise<string> {
  const res = await apiJson<ChatAttachmentUrlResponse>(
    `/api/v1/mobile/chat/attachments/${attachmentId}/url`
  );
  return res.url;
}

/**
 * Upload image to S3 and return attachmentId.
 * Validates: max 5MB. Compresses via quality option in picker.
 */
export async function uploadImage(params: {
  roomId: string;
  uri: string;
  mimeType: string;
  fileName: string;
  fileSizeBytes: number;
}): Promise<string> {
  if (params.fileSizeBytes > MAX_IMAGE_BYTES) {
    throw new Error(`Image must be under ${MAX_IMAGE_BYTES / (1024 * 1024)}MB`);
  }

  const { uploadUrl, attachmentId } = await getUploadUrl({
    roomId: params.roomId,
    mimeType: params.mimeType,
    fileName: params.fileName,
    messageType: 'image',
    fileSizeBytes: params.fileSizeBytes,
  });

  const blob = await uriToBlob(params.uri, params.mimeType);
  await uploadToPresignedUrl(uploadUrl, blob, params.mimeType);
  return attachmentId;
}

/**
 * Upload audio blob to S3 and return attachmentId.
 * Validates: max 2 min duration. Caller should pass durationSeconds from recording.
 */
export async function uploadAudio(params: {
  roomId: string;
  blob: Blob;
  mimeType: string;
  fileName: string;
  durationSeconds?: number;
}): Promise<string> {
  if (params.durationSeconds && params.durationSeconds > MAX_AUDIO_SECONDS) {
    throw new Error('Audio must be under 2 minutes');
  }

  const { uploadUrl, attachmentId } = await getUploadUrl({
    roomId: params.roomId,
    mimeType: params.mimeType,
    fileName: params.fileName,
    messageType: 'audio',
    durationSeconds: params.durationSeconds,
    fileSizeBytes: params.blob.size,
  });

  await uploadToPresignedUrl(uploadUrl, params.blob, params.mimeType);
  return attachmentId;
}

export function useUploadChatMedia() {
  return {
    uploadImage,
    uploadAudio,
    getAttachmentUrl,
    limits: {
      maxImageBytes: MAX_IMAGE_BYTES,
      maxAudioSeconds: MAX_AUDIO_SECONDS,
    },
  };
}
