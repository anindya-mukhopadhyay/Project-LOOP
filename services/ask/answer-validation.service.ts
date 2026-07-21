import { Citation } from "@/schemas/ask.schema";

export interface AnswerValidationResult {
  isValid: boolean;
  errors: string[];
}

export class AnswerValidationService {
  validate(answer: string, citations: Citation[], confidence: number): AnswerValidationResult {
    const errors: string[] = [];

    if (!answer || answer.trim().length === 0) {
      errors.push("Generated answer is empty.");
    }

    if (citations.length === 0) {
      errors.push("Answer lacks citations and may contain hallucinations.");
    }

    if (confidence < 0.6) {
      errors.push("Answer confidence is below minimum threshold of 0.6.");
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}
