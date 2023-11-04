import { IsEmail, IsString, IsNotEmpty } from "class-validator";

export class AuthDto {
    @IsEmail()
    email: string;

    @IsString()
    @IsNotEmpty()
    password: string;
}