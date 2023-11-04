import { ForbiddenException, Injectable } from "@nestjs/common";
import * as argon from 'argon2';
import { PrismaService } from "src/prisma/prisma.service";
import { AuthDto } from "./dto";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";

@Injectable()
export class AuthService {

    constructor(private readonly prismaService: PrismaService) {}

    async signup(dto: AuthDto) {
        try {
            const hashedPassword = await argon.hash(dto.password)
            const user = await this.prismaService.user.create({
                data: {
                    email: dto.email,
                    password: hashedPassword
                }
            });
            delete user.password;
            return user;
        } catch (err) {
            if(err instanceof PrismaClientKnownRequestError) {
                if(err.code === 'P2002') {
                    throw new ForbiddenException('Credentials taken');
                }
            }
            throw err;
        }        
    }
    
    async signin(dto: AuthDto) {
        const user = await this.prismaService.user.findUnique({
            where: { email: dto.email }
        })
        if(!user) throw new ForbiddenException('Credentials incorrect');

        const passwordMatch = await argon.verify(user.password, dto.password);
        if(!passwordMatch) throw new ForbiddenException('Credentials incorrect');

        delete user.password;
        return user;
    }
}