ALTER TABLE "invitations" ADD COLUMN IF NOT EXISTS "entitlement_id" text;
ALTER TABLE "invitations" ADD COLUMN IF NOT EXISTS "external_builder_id" text;
ALTER TABLE "invitations" ADD COLUMN IF NOT EXISTS "external_builder_url" text;

DO $$ BEGIN
  CREATE TYPE "purchase_status" AS ENUM('pending', 'paid', 'failed', 'expired', 'cancelled');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE "entitlement_status" AS ENUM('available', 'used', 'expired', 'revoked');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS "template_purchases" (
  "id" text PRIMARY KEY,
  "user_id" text NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "template_id" text NOT NULL,
  "template_name" text NOT NULL,
  "template_slug" text NOT NULL,
  "amount" integer NOT NULL,
  "currency" text NOT NULL DEFAULT 'IDR',
  "status" "purchase_status" NOT NULL DEFAULT 'pending',
  "external_order_id" text,
  "payment_url" text,
  "created_at" timestamp NOT NULL DEFAULT now(),
  "updated_at" timestamp NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "entitlements" (
  "id" text PRIMARY KEY,
  "user_id" text NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "template_id" text NOT NULL,
  "template_name" text NOT NULL,
  "order_id" text REFERENCES "template_purchases"("id"),
  "usage_limit" integer NOT NULL DEFAULT 1,
  "used_count" integer NOT NULL DEFAULT 0,
  "status" "entitlement_status" NOT NULL DEFAULT 'available',
  "used_at" timestamp,
  "expires_at" timestamp,
  "created_at" timestamp NOT NULL DEFAULT now(),
  "updated_at" timestamp NOT NULL DEFAULT now()
);
