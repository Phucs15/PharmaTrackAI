/**
 * Standard `toJSON` transform shared by most models: maps Mongo's `_id`
 * to a plain string `id` (matching the frontend's flat `id` fields like
 * "med-001"/"batch-001"), drops `__v`, and includes virtuals.
 */
export function applyIdTransform(schema, options = {}) {
  schema.set('toJSON', {
    virtuals: true,
    versionKey: false,
    transform(doc, ret) {
      ret.id = ret._id?.toString();
      delete ret._id;
      if (options.hidePassword) delete ret.password;
      return ret;
    },
  });
}
