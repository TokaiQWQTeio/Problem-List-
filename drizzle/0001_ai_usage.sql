CREATE TABLE `ai_usage` (
  `github_user_id` text NOT NULL,
  `usage_day` text NOT NULL,
  `count` integer NOT NULL,
  PRIMARY KEY (`github_user_id`, `usage_day`)
);
--> statement-breakpoint
PRAGMA optimize;
