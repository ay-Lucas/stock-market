import { NextFunction } from "express";
import { Request, Response } from "express";

/**
 * Middleware to validate the specified params and query parameters.
 * @param params - Array of parameter names to validate in `req.params`.
 * @param queryParams - Array of query parameter names to validate in `req.query`.
 */
export const validateFields = (
  params: string[] = [],
  queryParams: string[] = [],
) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const errors: string[] = [];

    // Validate `req.params`
    params.forEach((param) => {
      if (!req.params[param]) {
        errors.push(`Missing required param: '${param}'`);
      }
    });

    // Validate `req.query`
    queryParams.forEach((field) => {
      if (!req.query[field]) {
        errors.push(`Missing required query parameter: '${field}'`);
      }
    });

    if (errors.length > 0) {
      res.status(400).json({ errors });
      return;
    }

    next();
  };
};
