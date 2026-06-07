import { IsNotEmpty } from "class-validator/types/decorator/common/IsNotEmpty";
import { MaxLength } from "class-validator/types/decorator/string/MaxLength";
import { IsString } from "class-validator/types/decorator/typechecker/IsString";

export class CreateSeniorityDto {
    @IsString({ message: 'El nombre de la seniority debe ser una cadena de texto' })
    @IsNotEmpty({ message: 'El nombre de la seniority es obligatorio' })
    @MaxLength(50, { message: 'El nombre de la seniority no puede exceder los 50 caracteres' })
    name: string;
}
