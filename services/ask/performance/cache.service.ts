/* eslint-disable @typescript-eslint/no-unused-vars */
import { RankedDocument } from "../ranking.service";

export interface CacheService<T> {
  get(key: string): Promise<T | null>;
  set(key: string, value: T, ttlSeconds?: number): Promise<void>;
  invalidate(key: string): Promise<void>;
}

export class EmbeddingCache implements CacheService<number[]> {
  async get(_key: string): Promise<number[] | null> { return null; }
  async set(_key: string, _value: number[], _ttlSeconds?: number): Promise<void> {}
  async invalidate(_key: string): Promise<void> {}
}

export class ContextCache implements CacheService<RankedDocument[]> {
  async get(_key: string): Promise<RankedDocument[] | null> { return null; }
  async set(_key: string, _value: RankedDocument[], _ttlSeconds?: number): Promise<void> {}
  async invalidate(_key: string): Promise<void> {}
}

export class ResponseCache implements CacheService<{answer: string; confidence: number; reasoning: string}> {
  async get(_key: string): Promise<{answer: string; confidence: number; reasoning: string} | null> { return null; }
  async set(_key: string, _value: {answer: string; confidence: number; reasoning: string}, _ttlSeconds?: number): Promise<void> {}
  async invalidate(_key: string): Promise<void> {}
}
