import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { LocataireService } from '../locataire/locataire.service';
import { LoginDto } from './dto/login.dto';
import { LocataireLoginDto } from './dto/locataire-login.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private locataireService: LocataireService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.usersService.findByEmail(email);
    if (user && await bcrypt.compare(password, user.password)) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(loginDto: LoginDto) {
    const user = await this.validateUser(loginDto.email, loginDto.password);
    
    if (!user) {
      throw new UnauthorizedException('Email ou mot de passe incorrect');
    }

    // Vérifier si l'utilisateur est un admin
    // if (user.categorie !== 1) { // 1 = ADMIN
    //   throw new UnauthorizedException('Accès non autorisé. Seuls les administrateurs peuvent se connecter.');
    // }

    // Mettre à jour last_login_at
    await this.usersService.updateLastLogin(user.id);

    const payload = { 
      sub: user.id, 
      email: user.email,
      categorie: user.categorie,
      type: 'user'
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        categorie: user.categorie
      }
    };
  }

  async validateLocataire(mobile: string, password: string): Promise<any> {
    try {
      const locataire = await this.locataireService.findByMobile(mobile);
      if (locataire && await bcrypt.compare(password, locataire.password)) {
        const { password, ...result } = locataire;
        return result;
      }
      return null;
    } catch (error) {
      return null;
    }
  }

  async loginLocataire(locataireLoginDto: LocataireLoginDto) {
    const locataire = await this.validateLocataire(
      locataireLoginDto.mobile,
      locataireLoginDto.password,
    );
    
    if (!locataire) {
      throw new UnauthorizedException('Numéro de téléphone ou mot de passe incorrect');
    }

    // Mettre à jour last_login_at
    await this.locataireService.updateLastLogin(locataire.id);

    const payload = { 
      sub: locataire.id, 
      mobile: locataire.mobile,
      type: 'locataire'
    };

    return {
      access_token: this.jwtService.sign(payload),
      locataire: {
        id: locataire.id,
        firstname: locataire.firstname,
        lastname: locataire.lastname,
        mobile: locataire.mobile,
        email: locataire.email
      }
    };
  }
}
