import { Connection } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { BaseSeed } from '@/database/seeds/base.seed';
import { UserRole } from '@/modules/auth/schemas/user.schema';

export class SeedAdmin extends BaseSeed {
  constructor(connection: Connection) {
    super(connection);
  }

  async seed(): Promise<void> {
    const usersCollection = this.connection.collection('users');

    const adminExists = await this.exists('users', {
      email: 'admin@itca.edu.sv',
    });

    if (adminExists) {
      console.log('Admin ya existe, omitiendo seed');
      return;
    }

    const hashedPassword = await bcrypt.hash('Itca123', 10);

    const adminUser = {
      email: 'admin@itca.edu.sv',
      password: hashedPassword,
      name: 'Administrador',
      role: UserRole.ADMIN,
      isActive: true,
    };

    await usersCollection.insertOne(adminUser);
    console.log('Admin creado exitosamente');
  }
}
