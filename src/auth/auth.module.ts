import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { LocataireModule } from '../locataire/locataire.module';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './strategies/jwt.strategy';
import { AgenceModule } from '../agence/agence.module';

@Module({
  imports: [
    UsersModule,
    LocataireModule,
    AgenceModule,
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'votre_secret_jwt_super_securise',
      signOptions: { expiresIn: '24h' },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService, JwtModule],
})
export class AuthModule {}
