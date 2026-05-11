export default () => ({
  MONGODB_URL: process.env.MONGODB_URL || 'mongodb://localhost:27017',
  DATABASE_NAME: process.env.DATABASE_NAME || 'ai_mock_interview',
  JWT_SECRET: process.env.JWT_SECRET || 'change_this_secret',
  JWT_ALGORITHM: process.env.JWT_ALGORITHM || 'HS256',
  ACCESS_TOKEN_EXPIRE_MINUTES: parseInt(process.env.ACCESS_TOKEN_EXPIRE_MINUTES || '1440', 10),
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || '',
  OPENAI_API_KEY: process.env.OPENAI_API_KEY || '',
  PORT: parseInt(process.env.PORT || '8000', 10),
});