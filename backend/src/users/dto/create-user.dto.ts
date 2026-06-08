import {
  IsString,
  IsEmail,
  IsNotEmpty,
  MinLength,
  MaxLength,
  IsOptional,
  IsEnum,
} from 'class-validator';

export enum UserRoleName{
  APPLICANT = 'applicant',
  RECRUITER = 'recruiter'
}

export class CreateUserDto {
  @IsString({ message: 'El nombre debe ser un texto válido' })
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  @MinLength(2, { message: 'El nombre debe tener al menos 2 caracteres' })
  @MaxLength(50, { message: 'El nombre es demasiado largo' })
  first_name: string;

  @IsString({ message: 'El apellido debe ser un texto válido' })
  @IsNotEmpty({ message: 'El apellido es obligatorio' })
  @MinLength(2, { message: 'El apellido debe tener al menos 2 caracteres' })
  @MaxLength(50, { message: 'El apellido es demasiado largo' })
  last_name: string;

  @IsEmail({}, { message: 'Debe ser un correo electrónico válido' })
  @IsNotEmpty({ message: 'El email es obligatorio' })
  @MaxLength(50, { message: 'El email es demasiado largo' })
  email: string;

  @IsString({ message: 'La contraseña debe ser un texto' })
  @IsNotEmpty({ message: 'La contraseña es obligatoria' })
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
  @MaxLength(50, { message: 'La contraseña es demasiado larga' })
  password: string;

  @IsEnum(UserRoleName, { message: 'El nombre del rol debe ser uno de los valores válidos' })
  @IsOptional()
  role_name?: string;
}
