import { z } from "zod";

const FIELD_TYPES = ["text", "textarea", "select", "date"] as const;

export const dynamicFieldSchema = z.object({
  name: z.string().min(1),
  label: z.string().min(1),
  type: z.enum(FIELD_TYPES),
  placeholder: z.string().optional(),
  options: z.array(z.string()).optional(),
  required: z.boolean().optional(),
});

export const dynamicFormSchema = z.object({
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/, "slug は半角英数字とハイフンのみ"),
  title: z.string().min(1),
  description: z.string().default(""),
  fields: z.array(dynamicFieldSchema).default([]),
  ambassadorOnly: z.boolean().default(false),
  larkTableId: z.string().nullable().default(null),
  isPublished: z.boolean().default(true),
  sortOrder: z.number().int().default(0),
});

export type DynamicFormInput = z.infer<typeof dynamicFormSchema>;
export type DynamicFormField = z.infer<typeof dynamicFieldSchema>;
