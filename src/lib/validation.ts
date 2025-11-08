import { z } from 'zod';

/**
 * Validation schema for narrative generation input
 */
export const narrativeInputSchema = z.object({
  input: z
    .string()
    .min(10, 'Please enter at least 10 characters to generate a meaningful narrative')
    .max(5000, 'Input must not exceed 5000 characters')
    .refine(
      (val) => val.trim().length > 0,
      'Input cannot be empty or contain only whitespace'
    ),
  tone: z.enum(['activist', 'scientific', 'political', 'inspirational'], {
    errorMap: () => ({ message: 'Please select a valid tone' }),
  }),
});

/**
 * Type definition for narrative input
 */
export type NarrativeInput = z.infer<typeof narrativeInputSchema>;

/**
 * Validates narrative input and returns typed result
 */
export function validateNarrativeInput(input: string, tone: string) {
  try {
    return {
      success: true as const,
      data: narrativeInputSchema.parse({ input, tone }),
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false as const,
        error: error.errors[0].message,
      };
    }
    return {
      success: false as const,
      error: 'An unexpected validation error occurred',
    };
  }
}
