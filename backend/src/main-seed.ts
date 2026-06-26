import { NestFactory } from '@nestjs/core';
import { SeedModule } from './seed/seed.module';
import { SeedService } from './seed/seed.service';

async function bootstrap() {
  console.log('🚀 Iniciando contexto de NestJS para el Seed...');
  
  const app = await NestFactory.createApplicationContext(SeedModule);
  
  const seedService = app.get(SeedService);

  try {
    await seedService.runSeed();
  } catch (error) {
    console.error('❌ Ocurrió un error fatal ejecutando el seed:', error);
  } finally {
    await app.close();
    console.log('👋 Conexión cerrada. Saliendo del script...');
    process.exit(0); 
  }
}

bootstrap();
