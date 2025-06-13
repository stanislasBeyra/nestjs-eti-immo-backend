import { Module, Global, forwardRef } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './strategies/jwt.strategy';
import { UsersModule } from '../users/users.module';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { LocataireModule } from 'src/locataire/locataire.module';

@Global()
@Module({
  imports: [
    UsersModule,
    forwardRef(() => LocataireModule),
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'votre_secret_jwt_super_securise',
      signOptions: { expiresIn: '1d' },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService, JwtModule],
})
export class AuthModule {}
