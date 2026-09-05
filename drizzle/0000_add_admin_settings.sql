CREATE TYPE "public"."attendance" AS ENUM('Hadir', 'Ragu', 'Tidak Hadir');--> statement-breakpoint
CREATE TYPE "public"."inv_status" AS ENUM('Aktif', 'Draf');--> statement-breakpoint
CREATE TYPE "public"."order_status" AS ENUM('Lunas', 'Menunggu', 'Kadaluarsa');--> statement-breakpoint
CREATE TYPE "public"."plan" AS ENUM('Gold', 'Platinum');--> statement-breakpoint
CREATE TYPE "public"."role" AS ENUM('admin', 'user');--> statement-breakpoint
CREATE TYPE "public"."template_cat" AS ENUM('Tradisional', 'Modern', 'Signature', 'Religius', 'Artistik');--> statement-breakpoint
CREATE TYPE "public"."tier" AS ENUM('Free', 'Gold', 'Platinum', 'Owner');--> statement-breakpoint
CREATE TYPE "public"."user_status" AS ENUM('Aktif', 'Ditangguhkan', 'Diblokir');--> statement-breakpoint
CREATE TABLE "admin_settings" (
	"id" text PRIMARY KEY NOT NULL,
	"data" jsonb NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "assets" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"category" text NOT NULL,
	"size" text NOT NULL,
	"url" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "couple_profiles" (
	"invitation_id" text PRIMARY KEY NOT NULL,
	"groom_name" text DEFAULT '' NOT NULL,
	"groom_nick" text DEFAULT '' NOT NULL,
	"groom_parents" text DEFAULT '' NOT NULL,
	"groom_bio" text DEFAULT '' NOT NULL,
	"groom_photo" text DEFAULT '' NOT NULL,
	"groom_instagram" text DEFAULT '' NOT NULL,
	"groom_tiktok" text DEFAULT '' NOT NULL,
	"bride_name" text DEFAULT '' NOT NULL,
	"bride_nick" text DEFAULT '' NOT NULL,
	"bride_parents" text DEFAULT '' NOT NULL,
	"bride_bio" text DEFAULT '' NOT NULL,
	"bride_photo" text DEFAULT '' NOT NULL,
	"bride_instagram" text DEFAULT '' NOT NULL,
	"bride_tiktok" text DEFAULT '' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "guests" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"category" text NOT NULL,
	"phone" text NOT NULL,
	"pax" integer DEFAULT 1 NOT NULL,
	"sent" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "invitations" (
	"id" text PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"title" text NOT NULL,
	"groom" text NOT NULL,
	"bride" text NOT NULL,
	"template" text NOT NULL,
	"status" "inv_status" DEFAULT 'Draf' NOT NULL,
	"views" integer DEFAULT 0 NOT NULL,
	"date" text NOT NULL,
	"owner_id" text NOT NULL,
	CONSTRAINT "invitations_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "music" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"artist" text NOT NULL,
	"genre" text NOT NULL,
	"duration" text NOT NULL,
	"url" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "orders" (
	"id" text PRIMARY KEY NOT NULL,
	"customer" text NOT NULL,
	"email" text NOT NULL,
	"plan" "plan" NOT NULL,
	"amount" integer NOT NULL,
	"method" text NOT NULL,
	"status" "order_status" DEFAULT 'Menunggu' NOT NULL,
	"date" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "prayers" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"category" text NOT NULL,
	"original" text NOT NULL,
	"latin" text NOT NULL,
	"translation" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "quotes" (
	"id" text PRIMARY KEY NOT NULL,
	"text" text NOT NULL,
	"author" text NOT NULL,
	"mood" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "rsvps" (
	"id" text PRIMARY KEY NOT NULL,
	"guest" text NOT NULL,
	"slug" text NOT NULL,
	"attendance" "attendance" NOT NULL,
	"pax" integer DEFAULT 1 NOT NULL,
	"message" text DEFAULT '' NOT NULL,
	"time" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sacred_texts" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"category" text NOT NULL,
	"body" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "templates" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"tag" text NOT NULL,
	"category" "template_cat" NOT NULL,
	"theme" text NOT NULL,
	"thumb" text NOT NULL,
	CONSTRAINT "templates_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"role" "role" DEFAULT 'user' NOT NULL,
	"tier" "tier" DEFAULT 'Free' NOT NULL,
	"invitations" integer DEFAULT 0 NOT NULL,
	"quota" integer DEFAULT 5 NOT NULL,
	"status" "user_status" DEFAULT 'Aktif' NOT NULL,
	"joined" text NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "couple_profiles" ADD CONSTRAINT "couple_profiles_invitation_id_invitations_id_fk" FOREIGN KEY ("invitation_id") REFERENCES "public"."invitations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invitations" ADD CONSTRAINT "invitations_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;