import { IsEmail, IsString, MinLength, MaxLength } from 'class-validator';

export class UserCreateDto {
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;
}

export class UserLoginDto {
  @IsEmail()
  email: string;

  @IsString()
  password: string;
}

export class UserResponseDto {
  id: string;
  name: string;
  email: string;
  created_at?: Date;
}

export class TokenResponseDto {
  access_token: string;
  token_type: string = 'bearer';
  user: UserResponseDto;
}