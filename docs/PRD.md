# Nova Chat Product Requirements Document

## 1. Overview

Nova Chat is a premium AI chat workspace for focused conversations with selectable AI models, persistent chat threads, authentication, and a polished dark-mode experience. The product is inspired by modern T3-style chat apps while emphasizing a refined workspace UI, reliable provider routing, and fast thread-based workflows.

## 2. Goals

- Provide a fast, dependable AI chat experience with persistent conversation history.
- Let users choose from supported Anthropic and OpenRouter models before sending prompts.
- Make dark mode feel polished, readable, and product-grade.
- Keep navigation between new and existing chats smooth with no route flicker.
- Give users clear settings and notification surfaces, even when empty states are minimal.
- Preserve a clean, productivity-focused interface without marketing-page clutter.

## 3. Target Users

- Developers testing prompts, model behavior, and code-generation workflows.
- Power users who want a lightweight AI workspace with multiple model options.
- Builders prototyping a T3-style AI chat product.

## 4. Core User Problems

- Users need conversations to persist across sessions.
- Users need model choices to be visible and recoverable.
- Users need clear feedback when model providers fail or are unavailable.
- Users need a dark-mode UI that feels intentional, not flat or unfinished.
- Users expect settings, notifications, profile actions, and new-chat flows to behave like a finished product.

## 5. Product Scope

### In Scope

- Authenticated chat workspace.
- Sidebar with searchable, grouped chat threads.
- New chat creation from prompts and direct new-chat navigation.
- Persistent messages and attachments.
- AI response streaming through configured providers.
- Model selector with OpenRouter/Anthropic metadata.
- User menu with profile, workspace, theme, and sign-out controls.
- Notification and settings surfaces.
- Premium light/dark visual system.
- App metadata, favicon, and logo assets.

### Out of Scope

- Multi-user real-time collaboration.
- Billing and usage metering.
- Team/workspace administration.
- Full notification backend.
- Full profile editing backend.
- Public sharing permissions.

## 6. Key Features

### 6.1 Authentication

Users must sign in before accessing the chat workspace.

Requirements:
- Protect chat routes.
- Show user identity in the sidebar footer.
- Provide sign-out from the user menu.

### 6.2 Chat Thread Management

Users can create, view, rename, pin, archive, delete, and search chat threads.

Requirements:
- New Chat opens the empty chat composer directly at `/chat`.
- Sending the first message creates a thread and navigates directly to `/chat/{chatId}`.
- Existing chats render grouped by recency.
- Active chat rows are visually distinct.

### 6.3 Messaging

Users can send messages, stream assistant responses, and view message history.

Requirements:
- User messages render immediately.
- Assistant responses stream into the current thread.
- Errors are displayed in readable language.
- Long assistant responses remain readable in dark mode.

### 6.4 Model Selection

Users can select an AI model before sending a message.

Requirements:
- Persist selected model locally.
- Show model provider, context window, and free/paid state where available.
- Normalize stale provider model IDs where possible.
- Fallback gracefully when OpenRouter returns unavailable-model errors.

### 6.5 Settings

Users can access workspace and profile settings surfaces.

Requirements:
- Header settings button opens a workspace settings dialog.
- User menu Profile Settings opens a profile dialog.
- User menu Workspace Settings opens a workspace dialog.
- Theme controls support light, dark, and system mode.

### 6.6 Notifications

Users can open a notification popover from the header.

Requirements:
- The notification button opens a polished popover.
- Empty state clearly communicates no unread alerts.
- Popover supports outside click, Escape, and keyboard accessibility.

### 6.7 Visual Design

Nova Chat should feel like a premium dark productivity app.

Requirements:
- Use near-black and deep charcoal layers, not pure flat black everywhere.
- Maintain at least 3-4 distinct dark surfaces.
- Use subtle borders, restrained elevation, and clear typography hierarchy.
- Avoid loud gradients, neon effects, and decorative blobs.
- Ensure readability for messages, dropdowns, dialogs, and composer states.

## 7. UX Requirements

- Navigation must avoid flicker, double redirects, and home-page bounces.
- Keyboard focus states must be visible.
- Dialogs and popovers must be accessible and dismissible.
- Composer controls must be reachable by keyboard.
- Sidebar actions must not obscure or conflict with thread selection.
- Empty states should feel calm and useful.

## 8. Technical Requirements

- Use Next.js App Router conventions.
- Use server actions for authenticated data mutations.
- Keep Prisma as the persistence layer.
- Use existing UI primitives before creating custom interaction logic.
- Keep changes scoped to current architecture.
- Avoid leaking provider API keys to the client.
- Keep provider errors user-readable.

## 9. Data Model

Primary entities:
- User
- Chat
- Message
- Attachment

Important relationships:
- A user owns many chats.
- A chat contains many messages.
- A message may have many attachments.

## 10. Success Metrics

- New chat creation lands directly on the created chat route.
- Users can open notifications, settings, profile settings, and workspace settings.
- Users can select a model and send a message without UI confusion.
- Dark mode is visually cohesive across sidebar, header, messages, dropdowns, dialogs, and composer.
- Provider failures produce readable recovery messages.

## 11. Risks

- OpenRouter model availability changes frequently.
- Free models may be rate-limited or provider-routed unpredictably.
- Strict lint rules may expose existing legacy code issues outside current feature work.
- Browser favicon caching may delay visible icon updates during development.

## 12. Future Enhancements

- Real notification backend.
- Editable profile settings.
- Workspace-level preferences persisted in the database.
- Usage analytics and token/cost tracking.
- Shared conversation links with access controls.
- Multi-modal attachment processing.
- User-managed provider API keys.
