import { ZodError } from "zod";

export default (schema) => (req, res, next) => {
  try {
    if (schema.body) req.body = schema.body.parse(req.body);
    if (schema.params) req.params = schema.params.parse(req.params);
    if (schema.query) req.query = schema.query.parse(req.query);
    next();
  } catch (e) {
    if (e instanceof ZodError)
      return res
        .status(400)
        .json({ error: "validation_error", details: e.issues });
    next(e);
  }
};
