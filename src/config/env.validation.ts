import * as Joi from 'joi';

// Validação de variáveis de ambiente (RNF-052) — falha cedo se faltar segredo.
export const envValidationSchema = Joi.object({
  NODE_ENV: Joi.string().valid('development', 'staging', 'production', 'test').default('development'),
  PORT: Joi.number().default(3000),
  DATABASE_URL: Joi.string().required(),
  JWT_SECRET: Joi.string().min(32).required(),
  JWT_REFRESH_SECRET: Joi.string().min(32).invalid(Joi.ref('JWT_SECRET')).required(),
  JWT_EXPIRATION: Joi.string().default('15m'),
  REFRESH_EXPIRATION: Joi.string().default('7d'),
  CORS_ORIGIN: Joi.string().default('http://localhost:5173'),
  THROTTLE_TTL: Joi.number().default(60),
  THROTTLE_LIMIT: Joi.number().default(100),
});
