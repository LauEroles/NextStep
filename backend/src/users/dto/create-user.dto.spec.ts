
import { CreateUserDto } from "./create-user.dto";
import { ValidationError, validate } from 'class-validator';
import { describe, it, expect , beforeEach } from '@jest/globals';
describe("create-userDto", () => {
    it("should be valid with correct data", async() => {
        const dto:CreateUserDto = new CreateUserDto();
        dto.first_name= "Jose";
        dto.last_name="peña";
        dto.email="Jose@gmail.com";
        dto.password="12345678";
        dto.role_name = "applicant";
        dto.birth_date = "2000-04-27";
        const errors: ValidationError[] = await validate(dto);
        expect(errors.length).toBe(0);
    });
})