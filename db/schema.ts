import { integer, primaryKey, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const oauthStates = sqliteTable("oauth_states", {
  stateHash: text("state_hash").primaryKey(),
  expiresAt: integer("expires_at").notNull(),
  createdAt: text("created_at").notNull(),
});

export const sessions = sqliteTable("sessions", {
  sessionHash: text("session_hash").primaryKey(),
  username: text("username").notNull(),
  githubUserId: text("github_user_id").notNull(),
  encryptedAccessToken: text("encrypted_access_token").notNull(),
  tokenNonce: text("token_nonce").notNull(),
  csrfToken: text("csrf_token").notNull(),
  expiresAt: integer("expires_at").notNull(),
  createdAt: text("created_at").notNull(),
});

export const aiUsage = sqliteTable("ai_usage", {
  githubUserId: text("github_user_id").notNull(),
  usageDay: text("usage_day").notNull(),
  count: integer("count").notNull(),
}, (table) => [primaryKey({ columns: [table.githubUserId, table.usageDay] })]);

export const aiProviderKeys = sqliteTable("ai_provider_keys", {
  provider: text("provider").primaryKey(),
  encryptedKey: text("encrypted_key"),
  keyNonce: text("key_nonce"),
  disabled: integer("disabled").notNull().default(0),
  updatedAt: text("updated_at").notNull(),
});

export const aiModelOptions = sqliteTable("ai_model_options", {
  provider: text("provider").notNull(),
  modelId: text("model_id").notNull(),
  label: text("label").notNull(),
  enabled: integer("enabled").notNull(),
  updatedAt: text("updated_at").notNull(),
}, (table) => [primaryKey({ columns: [table.provider, table.modelId] })]);

export const aiSettings = sqliteTable("ai_settings", {
  id: integer("id").primaryKey(),
  defaultProvider: text("default_provider").notNull(),
  defaultModelId: text("default_model_id").notNull(),
});
