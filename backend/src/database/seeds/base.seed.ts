import { Connection } from 'mongoose';

export abstract class BaseSeed {
  constructor(protected readonly connection: Connection) {}

  abstract seed(): Promise<void>;

  async execute(): Promise<void> {
    try {
      await this.seed();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Error desconocido';
      throw new Error(
        `Error en seed ${this.constructor.name}: ${errorMessage}`,
      );
    }
  }

  protected async clearCollection(collectionName: string): Promise<void> {
    const collection = this.connection.collection(collectionName);
    await collection.deleteMany({});
  }

  protected async exists(
    collectionName: string,
    filter: object,
  ): Promise<boolean> {
    const collection = this.connection.collection(collectionName);
    const count = await collection.countDocuments(filter);
    return count > 0;
  }
}
