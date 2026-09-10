CREATE TABLE `oauth_states` (
  `state_hash` text PRIMARY KEY NOT NULL,
  `expires_at` integer NOT NULL,
  `created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_oauth_states_expires_at` ON `oauth_states` (`expires_at`);
--> statement-breakpoint
CREATE TABLE `sessions` (
  `session_hash` text PRIMARY KEY NOT NULL,
  `username` text NOT NULL,
  `github_user_id` integer NOT NULL,
  `encrypted_access_token` text NOT NULL,
  `token_nonce` text NOT NULL,
  `csrf_token` text NOT NULL,
  `expires_at` integer NOT NULL,
  `created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_sessions_expires_at` ON `sessions` (`expires_at`);
--> statement-breakpoint
CREATE INDEX `idx_sessions_username` ON `sessions` (`username`);
--> statement-breakpoint
PRAGMA optimize;
