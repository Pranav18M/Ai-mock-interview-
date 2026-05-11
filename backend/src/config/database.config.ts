import { ConfigService } from '@nestjs/config';

export const databaseConfig = {
  useFactory: (configService: ConfigService) => ({
    uri: configService.get<string>('MONGODB_URL'),
    dbName: configService.get<string>('DATABASE_NAME'),
  }),
  inject: [ConfigService],
};