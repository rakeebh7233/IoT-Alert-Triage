import { z } from 'zod';

// Sub-schema for sensor inputs
const InputSchema = z.object({
  input_name: z.string(),
  input_value: z.number(),
});

// Shared fields for all message types
const BaseMessage = z.object({
  device_id: z.string().min(1, "Device ID cannot be empty"),
  timestamp: z.number().int().positive("Invalid or missing timestamp"),
});

// Discriminated union for different message structures
export const SensorMessageSchema = z.discriminatedUnion('message_type', [
  BaseMessage.extend({
    message_type: z.literal('reading'),
    inputs: z.array(InputSchema).min(1, "Readings must contain at least one input"),
  }),
  BaseMessage.extend({
    message_type: z.union([z.literal('alert'), z.literal('recovery')]),
    alert_type: z.string(),
    severity: z.enum(['info', 'warning', 'critical']),
    // Support for optional threshold fields seen in some alert/recovery messages
    threshold: z.number().optional(),
    reading_value: z.number().optional(),
    reading_name: z.string().optional(),
  }),
]);

// Extract TypeScript types from the Zod schemas
export type SensorMessage = z.infer<typeof SensorMessageSchema>;