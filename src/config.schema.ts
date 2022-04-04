import * as Joi from '@hapi/joi';

export const configValidationSchema = Joi.object({
  PORT: Joi.number().default(3000),
  MONGODB_HOST: Joi.string().required(),
  JWT_ACCESS_TOKEN: Joi.string().required(),
  JWT_ACCESS_EXPIRED: Joi.string().required(),
  JWT_REFRESH_TOKEN: Joi.string().required(),
  JWT_REFRESH_EXPIRED: Joi.string().required(),
  THROTTLE_LIMIT: Joi.number().required(),
  THROTTLE_TTL: Joi.number().required(),
});
