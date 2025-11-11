-- CreateEnum
CREATE TYPE "CapexTriggerType" AS ENUM ('CYCLE', 'UTILIZATION', 'CUSTOM_DATE');

-- CreateEnum
CREATE TYPE "RentModelType" AS ENUM ('FIXED_ESC', 'REV_SHARE', 'PARTNER');

-- CreateTable
CREATE TABLE "capex_category" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "capex_category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "capex_rule" (
    "id" TEXT NOT NULL,
    "category_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "trigger_type" "CapexTriggerType" NOT NULL,
    "trigger_params" JSONB NOT NULL,
    "base_cost" DECIMAL(14,2),
    "cost_per_student" DECIMAL(14,2),
    "escalation_rate" DECIMAL(5,4),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "capex_rule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_log" (
    "id" TEXT NOT NULL,
    "actor_id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "entity_type" TEXT NOT NULL,
    "entity_id" TEXT,
    "metadata" JSONB,
    "ip" TEXT,
    "user_agent" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_log_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rent_model_template" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "RentModelType" NOT NULL,
    "params" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "rent_model_template_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "capex_rule_category_id_idx" ON "capex_rule"("category_id");

-- CreateIndex
CREATE INDEX "audit_log_actor_id_created_at_idx" ON "audit_log"("actor_id", "created_at");

-- CreateIndex
CREATE INDEX "audit_log_entity_type_entity_id_idx" ON "audit_log"("entity_type", "entity_id");

-- AddForeignKey
ALTER TABLE "capex_rule" ADD CONSTRAINT "capex_rule_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "capex_category"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_log" ADD CONSTRAINT "audit_log_actor_id_fkey" FOREIGN KEY ("actor_id") REFERENCES "profile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
