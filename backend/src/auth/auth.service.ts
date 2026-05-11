import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { User, UserDocument } from './schemas/user.schema';
import { UserCreateDto, UserLoginDto, TokenResponseDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  // Mirrors: hash_password using bcrypt (passlib bcrypt-compatible)
  private async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 12);
  }

  // Mirrors: verify_password
  private async verifyPassword(plain: string, hashed: string): Promise<boolean> {
    return bcrypt.compare(plain, hashed);
  }

  // Mirrors: create_access_token in jwt_handler.py
  // Payload: { sub: user_id, email, name, exp }
  private createAccessToken(payload: { sub: string; email: string; name: string }): string {
    const expireMinutes = this.configService.get<number>('ACCESS_TOKEN_EXPIRE_MINUTES') || 1440;
    return this.jwtService.sign(payload, {
      expiresIn: `${expireMinutes}m`,
    });
  }

  // Mirrors: register_user
  async register(dto: UserCreateDto): Promise<TokenResponseDto> {
    const existing = await this.userModel.findOne({ email: dto.email });
    if (existing) {
      throw new BadRequestException('Email already registered');
    }

    const created_at = new Date();
    const user = await this.userModel.create({
      name: dto.name,
      email: dto.email,
      password: await this.hashPassword(dto.password),
      created_at,
    });

    const user_id = (user._id as any).toString();
    const token = this.createAccessToken({ sub: user_id, email: dto.email, name: dto.name });

    return {
      access_token: token,
      token_type: 'bearer',
      user: { id: user_id, name: dto.name, email: dto.email, created_at },
    };
  }

  // Mirrors: login_user
  async login(dto: UserLoginDto): Promise<TokenResponseDto> {
    const user = await this.userModel.findOne({ email: dto.email });
    if (!user || !(await this.verifyPassword(dto.password, user.password))) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const user_id = (user._id as any).toString();
    const token = this.createAccessToken({ sub: user_id, email: user.email, name: user.name });

    return {
      access_token: token,
      token_type: 'bearer',
      user: { id: user_id, name: user.name, email: user.email, created_at: user.created_at },
    };
  }
}