import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

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
