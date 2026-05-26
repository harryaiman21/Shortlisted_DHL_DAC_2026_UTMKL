export interface User {
  id: string;
  username: string;
  password: string;
  role: "admin" | "editor" | "bot";
  name: string;
}

export interface StatusHistoryEntry {
  status: ArticleStatus;
  changedAt: string;
  by: string;
}

export type ArticleStatus = "Draft" | "Reviewed" | "Published";

export interface Article {
  id: string;
  title: string;
  summary: string;
  steps: string[];
  tags: string[];
  category: string;
  rawInput: string;
  source: string;
  status: ArticleStatus;
  statusHistory: StatusHistoryEntry[];
  createdBy: string;
  fileAttachments: string[];
  createdAt: string;
  updatedAt: string;
}

export interface DuplicateHash {
  id: string;
  hash: string;
  checkedAt: string;
}

export interface LogEntry {
  id: string;
  message: string;
  level: "info" | "error" | "warn";
  createdAt: string;
}

export interface DB {
  users: User[];
  articles: Article[];
  duplicateHashes: DuplicateHash[];
  logs: LogEntry[];
}

export interface TokenPayload {
  id: string;
  username: string;
  role: string;
}
