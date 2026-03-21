import { Connection } from 'mongoose';
import OpenAI from 'openai';
import { ConfigService } from '@nestjs/config';
import { BaseSeed } from '@/database/seeds/base.seed';
import { SeedGenerators } from './generators';
import { SeedSeeders } from './seeders';
import { SeedData } from './types';

export class SeedComplete extends BaseSeed {
  private openai: OpenAI | null = null;
  private configService: ConfigService | null = null;
  private generators: SeedGenerators | null = null;
  private seeders: SeedSeeders;

  constructor(connection: Connection, configService?: ConfigService) {
    super(connection);
    this.configService = configService || null;
    this.seeders = new SeedSeeders(connection);

    if (this.configService) {
      const apiKey = this.configService.get<string>('openai.apiKey');
      if (apiKey) {
        this.openai = new OpenAI({ apiKey });
        this.generators = new SeedGenerators(this.openai);
      }
    }

    if (!this.openai || !this.generators) {
      throw new Error(
        'OpenAI no está configurado. Se requiere una API key para ejecutar el seed completo.',
      );
    }
  }

  async seed(): Promise<void> {
    console.log('Iniciando seed completo con OpenAI...');

    if (!this.generators) {
      throw new Error('Generadores no inicializados');
    }

    // Generar y seedear en orden de dependencias
    console.log('Generando categorías de carrera...');
    const careerCategories = await this.generators.generateCareerCategories();
    await this.seeders.seedCareerCategories(careerCategories);

    console.log('Generando carreras...');
    const careers = await this.generators.generateCareers(careerCategories);
    await this.seeders.seedCareers(careers);

    console.log('Generando empresas...');
    const companies = await this.generators.generateCompanies();
    await this.seeders.seedCompanies(companies);
    await this.seeders.seedCompanyUsers();

    console.log('Generando estudiantes...');
    const students = await this.generators.generateStudents(careers);
    await this.seeders.seedStudents(students);

    console.log('Generando templates de oportunidades...');
    const opportunityTemplates =
      await this.generators.generateOpportunityTemplates();

    console.log('Generando oportunidades...');
    const opportunities = await this.generators.generateOpportunities(
      careers,
      companies,
    );
    await this.seeders.seedOpportunities(opportunities, opportunityTemplates);
    await this.seeders.seedApplications();

    console.log('Seed completo finalizado exitosamente');
  }
}

