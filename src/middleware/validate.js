const { ValidationError } = require('../errors/errors');

function toDetails(location, issue) {
  if (issue.code === 'unrecognized_keys') {
    return issue.keys.map((key) => ({ location, field: key, message: 'Unknown field' }));
  }
  return [{ location, field: issue.path.join('.'), message: issue.message }];
}

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
