import { OmitType, PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateUserDto extends PartialType(
  OmitType(CreateUserDto, ['roleName', 'birthDate'] as const),
) {
  @IsBoolean({ message: 'El estado debe ser un valor booleano' })
  @IsOptional()
  isActive?: boolean;
}
