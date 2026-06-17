
import { CreateUserDto } from "./create-user.dto";
import { ValidationError, validate } from 'class-validator';
import { describe, it, expect , beforeEach } from '@jest/globals';
describe("create-userDto", () => {
    it("verifico que el el objeto se cree de forma correcta ingresando los datos", async() => {
        const dto:CreateUserDto = new CreateUserDto();
        dto.firstName= "Jose";
        dto.lastName="peña";
        dto.email="Jose@gmail.com";
        dto.password="12345678";
        dto.roleName = "applicant";
        dto.birthDate = "2000-04-27";
        const errors: ValidationError[] = await validate(dto);
        expect(errors.length).toBe(0);
    });

})