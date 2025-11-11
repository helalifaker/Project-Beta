export function zodResolver() {
  return async <T>(values: T) => ({
    values,
    errors: {},
  });
}


