CREATE TABLE `ai_provider_keys` (
  `provider` text PRIMARY KEY NOT NULL,
  `encrypted_key` text,
  `key_nonce` text,
  `disabled` integer DEFAULT 0 NOT NULL,
  `updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `ai_model_options` (
  `provider` text NOT NULL,
  `model_id` text NOT NULL,
  `label` text NOT NULL,
  `enabled` integer NOT NULL,
  `updated_at` text NOT NULL,
  PRIMARY KEY (`provider`, `model_id`)
);
--> statement-breakpoint
CREATE TABLE `ai_settings` (
  `id` integer PRIMARY KEY NOT NULL,
  `default_provider` text NOT NULL,
  `default_model_id` text NOT NULL
);
--> statement-breakpoint
PRAGMA optimize;
