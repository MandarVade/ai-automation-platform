import { describe, it, expect } from 'vitest';
import { NLWorkflowPlanner } from '../src/core/workflow/nl-planner';

describe('NLWorkflowPlanner', () => {
  it('should plan a Finance pipeline from bill/expense prompt', () => {
    const prompt = 'Take a photo of my bill, extract items and prices, calculate total and categorize the expense.';
    const plan = NLWorkflowPlanner.planFromPrompt(prompt);

    expect(plan.detectedDomain).toBe('FINANCE');
    expect(plan.extractedSlots.trigger).toBe('CAMERA_CAPTURE');
    expect(plan.extractedSlots.aiCapabilities).toContain('OCR');
    expect(plan.extractedSlots.aiCapabilities).toContain('EXPENSE_CATEGORIZATION');
    expect(plan.extractedSlots.transforms).toContain('CALCULATE_TOTAL');
    expect(plan.generatedWorkflow.nodes.length).toBeGreaterThanOrEqual(4);
  });

  it('should plan an Education pipeline from lecture/notes prompt', () => {
    const prompt = 'Record my lecture, transcribe it, summarize important concepts and create 5 quiz questions.';
    const plan = NLWorkflowPlanner.planFromPrompt(prompt);

    expect(plan.detectedDomain).toBe('EDUCATION');
    expect(plan.extractedSlots.trigger).toBe('AUDIO_RECORD');
    expect(plan.extractedSlots.aiCapabilities).toContain('SPEECH_TO_TEXT');
    expect(plan.extractedSlots.aiCapabilities).toContain('QUESTION_GENERATION');
    expect(plan.generatedWorkflow.nodes.length).toBeGreaterThanOrEqual(5);
  });

  it('should plan a Botanical Healthcare pipeline from plant disease prompt', () => {
    const prompt = 'Take a photo of a plant, identify the disease, explain the symptoms and create a care plan.';
    const plan = NLWorkflowPlanner.planFromPrompt(prompt);

    expect(plan.detectedDomain).toBe('HEALTHCARE');
    expect(plan.extractedSlots.trigger).toBe('CAMERA_CAPTURE');
    expect(plan.extractedSlots.aiCapabilities).toContain('PLANT_DISEASE_DIAGNOSIS');
    expect(plan.extractedSlots.actions).toContain('CARE_PLAN_STORE');
  });
});
