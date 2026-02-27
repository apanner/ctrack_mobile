# Phase 3 Chat Implementation Summary

## Overview

Chat has been implemented for ctrack_mobile with a Supabase-backed backend in ctrack_v0. Tables: `chat_rooms`, `chat_room_members`, `chat_messages`, `chat_attachments`.

---

## Backend (ctrack_v0)

### Chat Service (`lib/services/chat-service.ts`)

| Function | Description |
|----------|-------------|
| `getRoomsForUser(userId)` | Returns rooms user is a member of, with last message preview, unread count, sender profile |
| `getOrCreateDirectRoom(userId1, userId2)` | Creates or finds a direct room between two users |
| `getOrCreateProjectRoom(projectId)` | Creates or finds a project room, adds all project members |
| `getMessages(roomId, limit, before?)` | Paginated messages (50 per page) with sender profile |
| `sendMessage(roomId, userId, content, attachmentId?)` | Sends a text message |
| `addRoomMember(roomId, userId)` | Adds user to room |
| `isRoomMember(roomId, userId)` | Checks membership |

**RLS:** Users only see rooms they are members of. RLS policies in `072_mobile_chat_tables.sql` enforce this when using the Supabase client directly.

### API Routes

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/v1/mobile/chat/rooms` | List rooms for current user |
| POST | `/api/v1/mobile/chat/rooms` | Create room (`{ type: 'direct'\|'project', otherUserId?, projectId? }`) |
| GET | `/api/v1/mobile/chat/rooms/[id]` | Get single room |
| GET | `/api/v1/mobile/chat/rooms/[id]/messages` | Paginated messages (`?limit=50&before=<msgId>`) |
| POST | `/api/v1/mobile/chat/rooms/[id]/messages` | Send message (`{ content: string }`) |

---

## Mobile (ctrack_mobile)

### API Hooks (`lib/api/chat.ts`)

| Hook | Purpose |
|------|---------|
| `useChatRooms()` | Room list with last message, unread count |
| `useChatRoom(roomId)` | Single room details |
| `useChatMessages(roomId)` | Paginated messages + Realtime subscription |
| `useSendMessage(roomId)` | Send text message |
| `useCreateChatRoom()` | Create direct or project room |

### Screens

- **`app/(tabs)/chat.tsx`** – Room list with last message preview, unread badge, pull-to-refresh. Tap to navigate to room.
- **`app/chat/[roomId].tsx`** – Room view with message list (newest at bottom), text input + Send, optimistic send, paginate older on scroll up.

---

## Supabase Realtime

### Setup

1. **Enable Realtime for `chat_messages`** – Migration `080_realtime_chat_messages.sql` adds the table to the Realtime publication:
   ```sql
   ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;
   ```

2. **Mobile subscription** – In `lib/api/chat.ts`, `useChatMessages` subscribes via:
   ```ts
   supabase.channel(`room:${roomId}`)
     .on('postgres_changes', {
       event: 'INSERT',
       schema: 'public',
       table: 'chat_messages',
       filter: `room_id=eq.${roomId}`,
     }, () => { invalidateQueries(...) })
     .subscribe();
   ```

3. **Flow** – Messages go to Postgres via the Next.js API; mobile receives INSERT events via Realtime and invalidates the messages query to refetch.

### Notes

- Run migration `080_realtime_chat_messages.sql` before testing Realtime.
- If Realtime does not fire, confirm `chat_messages` is in `supabase_realtime` publication (Supabase Dashboard → Database → Replication).
- RLS applies to Realtime: only users who pass RLS on `chat_messages` will receive events.

---

## Creating Rooms

To start a chat from elsewhere in the app:

```ts
const createRoom = useCreateChatRoom();

// Direct message
await createRoom.mutateAsync({
  type: 'direct',
  otherUserId: targetUserId,
});

// Project room
await createRoom.mutateAsync({
  type: 'project',
  projectId: projectId,
});

// Navigate after creation
router.push(`/chat/${room.id}`);
```

---

## Deferred / Future

- Attachment upload (Phase 4) – `attachmentId` is supported in `sendMessage`; UI and upload flow TBD.
- Mark as read (update `chat_room_members.last_read_at`) – unread count is simplified (0 or 1).
- Retry on send fail – optimistic message shows "Failed to send"; retry button can be added.
