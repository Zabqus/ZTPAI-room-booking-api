const { ValidationError } = require('../errors/errors');

// Zamienia issue z Zoda na format { location, field, message }
function toDetails(location, issue) {
  // Nieznane pola: Zod zgłasza jeden issue z listą kluczy - rozbijamy go na osobne wpisy
  if (issue.code === 'unrecognized_keys') {
    return issue.keys.map((key) => ({ location, field: key, message: 'Unknown field' }));
  }
  return [{ location, field: issue.path.join('.'), message: issue.message }];
}

// Uniwersalny middleware: validate({ params, query, body }) - zbiera wszystkie błędy naraz
function validate(schemas) {
  return (req, res, next) => {
    const validated = {};
    const details = [];

    for (const location of ['params', 'query', 'body']) {
      const schema = schemas[location];
      if (!schema) continue;

      const result = schema.safeParse(req[location] ?? {});
      if (result.success) {
        validated[location] = result.data;
      } else {
        details.push(...result.error.issues.flatMap((issue) => toDetails(location, issue)));
      }
    }

    if (details.length > 0) {
      throw new ValidationError('Validation failed', details);
    }

    req.validated = validated;
    next();
  };
}

module.exports = { validate };
