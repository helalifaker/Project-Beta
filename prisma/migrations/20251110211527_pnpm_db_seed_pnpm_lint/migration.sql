-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'ANALYST', 'VIEWER');

-- CreateEnum
CREATE TYPE "VersionStatus" AS ENUM ('DRAFT', 'READY', 'LOCKED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "CurriculumCpiFrequency" AS ENUM ('ANNUAL', 'EVERY_2_YEARS', 'EVERY_3_YEARS');

-- CreateTable
CREATE TABLE "profile" (
    "id" TEXT NOT NULL,
    "external_id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'ANALYST',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "profile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workspace_setting" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL DEFAULT 'Default Workspace',
    "base_currency" TEXT NOT NULL DEFAULT 'SAR',
    "timezone" TEXT NOT NULL DEFAULT 'Asia/Riyadh',
    "discount_rate" DECIMAL(8,6) NOT NULL,
    "cpi_min" DECIMAL(5,4) NOT NULL,
    "cpi_max" DECIMAL(5,4) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "workspace_setting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "curriculum_template" (
    "id" TEXT NOT NULL,
    "workspace_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "capacity" INTEGER NOT NULL,
    "launch_year" INTEGER NOT NULL DEFAULT 2028,
    "tuition_base" DECIMAL(14,2) NOT NULL,
    "cpi_rate" DECIMAL(5,4) NOT NULL,
    "cpi_frequency" "CurriculumCpiFrequency" NOT NULL DEFAULT 'ANNUAL',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "curriculum_template_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "curriculum_ramp_step" (
    "id" TEXT NOT NULL,
    "template_id" TEXT NOT NULL,
    "year_offset" INTEGER NOT NULL,
    "utilisation" DECIMAL(5,4) NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "curriculum_ramp_step_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "curriculum_tuition_band" (
    "id" TEXT NOT NULL,
    "template_id" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "tuition" DECIMAL(14,2) NOT NULL,

    CONSTRAINT "curriculum_tuition_band_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "version" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "status" "VersionStatus" NOT NULL DEFAULT 'DRAFT',
    "description" TEXT,
    "owner_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "locked_at" TIMESTAMP(3),
    "approved_at" TIMESTAMP(3),

    CONSTRAINT "version_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "version_curriculum" (
    "id" TEXT NOT NULL,
    "version_id" TEXT NOT NULL,
    "curriculum_template_id" TEXT NOT NULL,
    "custom_capacity" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "version_curriculum_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "version_curriculum_ramp" (
    "id" TEXT NOT NULL,
    "version_curriculum_id" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "utilisation" DECIMAL(5,4) NOT NULL,

    CONSTRAINT "version_curriculum_ramp_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "version_curriculum_tuition" (
    "id" TEXT NOT NULL,
    "version_curriculum_id" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "tuition" DECIMAL(14,2) NOT NULL,

    CONSTRAINT "version_curriculum_tuition_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "profile_external_id_key" ON "profile"("external_id");

-- CreateIndex
CREATE UNIQUE INDEX "profile_email_key" ON "profile"("email");

-- CreateIndex
CREATE UNIQUE INDEX "curriculum_template_slug_key" ON "curriculum_template"("slug");

-- CreateIndex
CREATE INDEX "curriculum_template_workspace_id_slug_idx" ON "curriculum_template"("workspace_id", "slug");

-- CreateIndex
CREATE INDEX "curriculum_ramp_step_template_id_sort_order_idx" ON "curriculum_ramp_step"("template_id", "sort_order");

-- CreateIndex
CREATE UNIQUE INDEX "curriculum_ramp_step_template_id_year_offset_key" ON "curriculum_ramp_step"("template_id", "year_offset");

-- CreateIndex
CREATE UNIQUE INDEX "curriculum_tuition_band_template_id_year_key" ON "curriculum_tuition_band"("template_id", "year");

-- CreateIndex
CREATE INDEX "version_status_updated_at_idx" ON "version"("status", "updated_at");

-- CreateIndex
CREATE UNIQUE INDEX "version_curriculum_version_id_curriculum_template_id_key" ON "version_curriculum"("version_id", "curriculum_template_id");

-- CreateIndex
CREATE UNIQUE INDEX "version_curriculum_ramp_version_curriculum_id_year_key" ON "version_curriculum_ramp"("version_curriculum_id", "year");

-- CreateIndex
CREATE UNIQUE INDEX "version_curriculum_tuition_version_curriculum_id_year_key" ON "version_curriculum_tuition"("version_curriculum_id", "year");

-- AddForeignKey
ALTER TABLE "curriculum_template" ADD CONSTRAINT "curriculum_template_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspace_setting"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "curriculum_ramp_step" ADD CONSTRAINT "curriculum_ramp_step_template_id_fkey" FOREIGN KEY ("template_id") REFERENCES "curriculum_template"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "curriculum_tuition_band" ADD CONSTRAINT "curriculum_tuition_band_template_id_fkey" FOREIGN KEY ("template_id") REFERENCES "curriculum_template"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "version" ADD CONSTRAINT "version_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "profile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "version_curriculum" ADD CONSTRAINT "version_curriculum_version_id_fkey" FOREIGN KEY ("version_id") REFERENCES "version"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "version_curriculum" ADD CONSTRAINT "version_curriculum_curriculum_template_id_fkey" FOREIGN KEY ("curriculum_template_id") REFERENCES "curriculum_template"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "version_curriculum_ramp" ADD CONSTRAINT "version_curriculum_ramp_version_curriculum_id_fkey" FOREIGN KEY ("version_curriculum_id") REFERENCES "version_curriculum"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "version_curriculum_tuition" ADD CONSTRAINT "version_curriculum_tuition_version_curriculum_id_fkey" FOREIGN KEY ("version_curriculum_id") REFERENCES "version_curriculum"("id") ON DELETE CASCADE ON UPDATE CASCADE;
