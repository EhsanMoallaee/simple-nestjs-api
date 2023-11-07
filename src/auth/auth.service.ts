import { ConfigService } from '@nestjs/config';
import { ForbiddenException, Injectable } from "@nestjs/common";
import * as argon from 'argon2';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from "../prisma/prisma.service";
import { AuthDto } from "./dto";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";

@Injectable()
export class AuthService {

    constructor(
        private readonly prismaService: PrismaService,
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService  
    ) {}

    async signup(dto: AuthDto) {
        try {
            const hashedPassword = await argon.hash(dto.password)
            const user = await this.prismaService.user.create({
                data: {
                    email: dto.email,
                    password: hashedPassword
                }
            });
            return this.signToken(user.id, user.email);
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

        return this.signToken(user.id, user.email);
    }

    async signToken(userId: number, email: string): Promise<{access_token: string}> {
        const payload = {
            sub: userId,
            email
        };
        const secret = this.configService.get('JWT_SECRET');
        const token = await this.jwtService.signAsync(payload, {
            expiresIn: '15m',
            secret 
        })
        return { access_token: token }
    }
}