import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['log', 'error', 'warn', 'debug'],
  });

  // ── CORS — mirrors FastAPI CORSMiddleware config ──────────────────────────
  app.enableCors({
    origin: (origin, callback) => {
      const allowedOrigins = [
        'https://mockinterview-ai.vercel.app',
        'http://localhost:5173',
        'http://localhost:3000',
        'http://127.0.0.1:5173',
      ];
      const vercelRegex = /^https:\/\/.*\.vercel\.app$/;

      if (!origin || allowedOrigins.includes(origin) || vercelRegex.test(origin)) {
        callback(null, true);
      } else {
        callback(null, false);
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Authorization', 'Content-Type', 'Accept', 'Origin', 'X-Requested-With'],
    exposedHeaders: ['*'],
    maxAge: 86400,
  });

  // ── Global validation pipe (DTO validation) ───────────────────────────────
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: false,
      transform: true,
    }),
  );

  const port = process.env.PORT || 8000;
  await app.listen(port);

  console.log('=== ENV CHECK ===');
  console.log(`  MONGODB_URL   : ${process.env.MONGODB_URL ? '✓ set' : '✗ MISSING'}`);
  console.log(`  DATABASE_NAME : ${process.env.DATABASE_NAME || 'ai_mock_interview'}`);
  console.log(`  JWT_SECRET    : ${process.env.JWT_SECRET && process.env.JWT_SECRET !== 'change_this_secret' ? '✓ set' : '⚠ using default'}`);
  console.log(`  GEMINI_API_KEY: ${process.env.GEMINI_API_KEY ? `✓ set (starts with ${process.env.GEMINI_API_KEY.slice(0, 4)})` : '✗ MISSING — AI features will fail!'}`);
  console.log('=================');
  console.log(`AI Mock Interview API running on port ${port}`);
}

bootstrap();