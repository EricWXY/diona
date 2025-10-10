import { WINDOW_NAMES } from './constants';

export type WindowNames = `${WINDOW_NAMES}`;

export interface Conversation {
  id: number;
  title: string;
  selectedModel: string;
  createdAt: number;
  updatedAt: number;
  providerId: number;
  pinned: boolean;
  type?: 'divider' | 'conversation';
}

export type MessageStatus = 'loading' | 'streaming' | 'success' | 'error';
export interface Message {
  id: number;
  content: string;
  type: 'question' | 'answer';
  createdAt: number;
  updatedAt?: number;
  status?: MessageStatus
  conversationId: number;
}

