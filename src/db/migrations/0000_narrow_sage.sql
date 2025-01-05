CREATE TABLE "expenses" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"title" text NOT NULL,
	"amount" numeric NOT NULL,
	"description" text,
	"category" text,
	"date" timestamp with time zone DEFAULT now(),
	"is_recurring" boolean DEFAULT false,
	"paid_at" timestamp,
	"due_date" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "incomes" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"source" text NOT NULL,
	"amount" numeric NOT NULL,
	"date" timestamp with time zone DEFAULT now()
);
