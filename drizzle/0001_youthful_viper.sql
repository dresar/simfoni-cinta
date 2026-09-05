CREATE TYPE "public"."entitlement_status" AS ENUM('available', 'used', 'expired', 'revoked');--> statement-breakpoint
CREATE TYPE "public"."purchase_status" AS ENUM('pending', 'paid', 'failed', 'expired', 'cancelled');--> statement-breakpoint
CREATE TABLE "entitlements" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"template_id" text NOT NULL,
	"template_name" text NOT NULL,
	"order_id" text,
	"usage_limit" integer DEFAULT 1 NOT NULL,
	"used_count" integer DEFAULT 0 NOT NULL,
	"status" "entitlement_status" DEFAULT 'available' NOT NULL,
	"used_at" timestamp,
	"expires_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "template_categories" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"order" integer DEFAULT 0 NOT NULL,
	"created_at" text NOT NULL,
	CONSTRAINT "template_categories_name_unique" UNIQUE("name"),
	CONSTRAINT "template_categories_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "template_purchases" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"template_id" text NOT NULL,
	"template_name" text NOT NULL,
	"template_slug" text NOT NULL,
	"amount" integer NOT NULL,
	"currency" text DEFAULT 'IDR' NOT NULL,
	"status" "purchase_status" DEFAULT 'pending' NOT NULL,
	"external_order_id" text,
	"payment_url" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "invitations" ALTER COLUMN "groom" SET DEFAULT '';--> statement-breakpoint
ALTER TABLE "invitations" ALTER COLUMN "bride" SET DEFAULT '';--> statement-breakpoint
ALTER TABLE "templates" ALTER COLUMN "category" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "quota" SET DEFAULT 0;--> statement-breakpoint
ALTER TABLE "invitations" ADD COLUMN "groom_nick" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "invitations" ADD COLUMN "groom_parents" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "invitations" ADD COLUMN "bride_nick" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "invitations" ADD COLUMN "bride_parents" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "invitations" ADD COLUMN "akad_time" text DEFAULT '08:00 - 10:00 WIB' NOT NULL;--> statement-breakpoint
ALTER TABLE "invitations" ADD COLUMN "resepsi_time" text DEFAULT '11:00 - 14:00 WIB' NOT NULL;--> statement-breakpoint
ALTER TABLE "invitations" ADD COLUMN "venue_name" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "invitations" ADD COLUMN "venue_address" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "invitations" ADD COLUMN "maps_url" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "invitations" ADD COLUMN "bank_name" text DEFAULT 'BCA' NOT NULL;--> statement-breakpoint
ALTER TABLE "invitations" ADD COLUMN "bank_account" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "invitations" ADD COLUMN "account_holder" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "invitations" ADD COLUMN "music_title" text DEFAULT 'A Thousand Years — Christina Perri' NOT NULL;--> statement-breakpoint
ALTER TABLE "invitations" ADD COLUMN "story" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "invitations" ADD COLUMN "live_url" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "invitations" ADD COLUMN "entitlement_id" text;--> statement-breakpoint
ALTER TABLE "invitations" ADD COLUMN "external_builder_id" text;--> statement-breakpoint
ALTER TABLE "invitations" ADD COLUMN "external_builder_url" text;--> statement-breakpoint
ALTER TABLE "entitlements" ADD CONSTRAINT "entitlements_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "entitlements" ADD CONSTRAINT "entitlements_order_id_template_purchases_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."template_purchases"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "template_purchases" ADD CONSTRAINT "template_purchases_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;