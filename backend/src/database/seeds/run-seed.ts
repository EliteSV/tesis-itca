import { NestFactory } from '@nestjs/core';
import { getConnectionToken } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import { AppModule } from '@/app.module';
import { SeedAdmin } from '@/database/seeds/seed-admin';
import { SeedComplete } from '@/database/seeds/seed-complete';
import { SeedProfessionalProfiles } from '@/database/seeds/seed-professional-profiles';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);

  const seedType = process.argv[2] || 'complete';

  try {
    const connection = app.get<Connection>(getConnectionToken());
    const configService = app.get<ConfigService>(ConfigService);

    switch (seedType) {
      case 'admin':
        await new SeedAdmin(connection).execute();
        break;
      case 'complete':
        await new SeedComplete(connection, configService).execute();
        break;
      case 'professional-profiles':
        await new SeedProfessionalProfiles(connection, configService).execute();
        break;
      default:
        console.error(`Tipo de seed desconocido: ${seedType}`);
        console.log('Tipos disponibles: admin, complete, professional-profiles');
        process.exit(1);
    }
  } catch (error) {
    console.error('Error ejecutando seed:', error);
    process.exit(1);
  } finally {
    await app.close();
  }
}

void bootstrap();
