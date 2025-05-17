import * as v from 'valibot';

export const FormSchema = v.object({
  name: v.pipe(v.string(), v.minLength(1), v.maxLength(50)),
  description: v.optional(v.pipe(v.string(), v.maxLength(100))),
  color: v.optional(v.string()),
});

export type FormInput = v.InferInput<typeof FormSchema>;

export const LabelSchema = v.object({
  name: v.pipe(v.string(), v.minLength(1), v.maxLength(50)),
  color: v.string(),
});

export type LabelInput = v.InferInput<typeof LabelSchema>;
