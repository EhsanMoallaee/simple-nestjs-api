import { Injectable } from "@nestjs/common";
import * as argon from 'argon2';
import { PrismaService } from "src/prisma/prisma.service";
import { AuthDto } from "./dto";

@Injectable()
export class AuthService {

    constructor(private readonly prismaService: PrismaService) {}

    async signup(dto: AuthDto) {
        const hashedPassword = await argon.hash(dto.password)
        const user = await this.prismaService.user.create({
            data: {
                email: dto.email,
                password: hashedPassword
            }
        });
        delete user.password;
        return user;
    }
    
    signin() {
        return { msg: 'I have signed in'}
    }
}