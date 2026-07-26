-- CreateTable
CREATE TABLE "integrations" (
    "id" UUID NOT NULL,
    "workspace_id" UUID NOT NULL,
    "provider" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "webhook_url" TEXT,
    "access_token" TEXT,
    "config" JSONB,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "created_by" UUID,
    "updated_by" UUID,

    CONSTRAINT "integrations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "integrations_workspace_id_idx" ON "integrations"("workspace_id");

-- AddForeignKey
ALTER TABLE "integrations" ADD CONSTRAINT "integrations_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;
