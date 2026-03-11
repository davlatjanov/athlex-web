export interface AIResponse {
	answer: string;
	conversationId?: string;
	timestamp?: string;
}

export interface AskAIInput {
	question: string;
	context?: string;
}

export interface AIChatMessage {
	role: string;
	content: string;
}

export interface ChatAIInput {
	messages: AIChatMessage[];
	conversationId?: string;
}

export interface Conversation {
	_id: string;
	topic?: string;
	messages: AIChatMessage[];
	createdAt: Date;
	updatedAt: Date;
}
