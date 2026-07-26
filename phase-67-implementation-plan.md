# Implementation Plan: Phase 67 (Export & Import)

## 1. Architecture

We will implement the Export & Import functionality following the existing monorepo architecture:

- **`apps/api`**: Create a new `export-import` module in NestJS. It will handle the extraction of data (Workspaces, Projects, Tasks, etc.) for export and the parsing/validation of uploaded data for import.
- **`apps/web`**: Create a new feature module or integrate into the `settings` / `projects` feature to provide UI for exporting data (e.g., as JSON/CSV) and importing data.

We will strictly follow the Clean Architecture principles established in the Flowlyx Engineering Handbook, utilizing the Repository Pattern and separating concerns (Controller -> Service -> Repository/Prisma).

## 2. Folder Structure

- **API (`apps/api/src/modules/export-import/`)**:
  - `controllers/export-import.controller.ts`
  - `services/export.service.ts`
  - `services/import.service.ts`
  - `dto/import-data.dto.ts`
  - `export-import.module.ts`
- **Web (`apps/web/src/features/export-import/`** or integrated into relevant context menus):
  - `components/export-dialog.tsx`
  - `components/import-dialog.tsx`
  - `api/export-import.api.ts`
  - `hooks/use-export.ts`
  - `hooks/use-import.ts`

## 3. Data Flow

**Export**:

1. User clicks "Export" in the web UI.
2. Web calls the API endpoint `GET /api/v1/export-import/workspace/:id/export` (for example).
3. API Controller receives the request, passes context (user ID, permissions) to `ExportService`.
4. `ExportService` aggregates data (Workspace, Projects, Boards, Tasks) using Prisma (respecting RBAC).
5. Data is serialized to JSON (or CSV) and returned as a downloadable file.

**Import**:

1. User selects a file (JSON) and clicks "Import" in the web UI.
2. Web uploads the file to `POST /api/v1/export-import/workspace/:id/import`.
3. API Controller passes the file buffer to `ImportService`.
4. `ImportService` parses and validates the data (using Zod/DTOs).
5. `ImportService` creates the necessary entities (Projects, Boards, Tasks) in the database via a Prisma transaction.
6. Returns success response.

## 4. Files to Create

**API**:

- `apps/api/src/modules/export-import/export-import.module.ts`
- `apps/api/src/modules/export-import/controllers/export-import.controller.ts`
- `apps/api/src/modules/export-import/services/export.service.ts`
- `apps/api/src/modules/export-import/services/import.service.ts`
- `apps/api/src/modules/export-import/dto/import-request.dto.ts`

**Web**:

- `apps/web/src/features/settings/components/export-import-section.tsx` (or similar location)
- `apps/web/src/features/settings/api/export-import.ts`

## 5. Files to Modify

- `apps/api/src/app.module.ts`: Register `ExportImportModule`.
- `apps/api/src/main.ts` (if needed for file upload configs, e.g., multer, though NestJS handles this well).

## 6. Dependencies

- We will leverage existing dependencies.
- `@nestjs/platform-express` for `FileInterceptor` (handling file uploads on import).
- No new external dependencies needed for JSON export/import. (If CSV is required later, we can add a lightweight CSV parser, but JSON is standard and safer for nested relational data).

## 7. Risks

- **Data Integrity**: Importing malicious or malformed JSON could corrupt the database. _Mitigation_: Strict DTO validation (Zod/class-validator) before any DB insertion.
- **Performance**: Exporting/Importing massive workspaces could cause memory spikes or timeouts. _Mitigation_: Pagination or streaming for very large datasets, though for standard use cases, memory aggregation is sufficient.
- **RBAC**: Ensuring users only export what they have access to, and only import into contexts where they have write permission. _Mitigation_: Use existing RBAC guards and inject current user context into Prisma queries.
