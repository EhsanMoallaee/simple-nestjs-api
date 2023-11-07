import { ForbiddenException } from '@nestjs/common';
import { Injectable } from '@nestjs/common';
import { CreateBookmarkDto, EditBookmarkDto } from './dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BookmarkService {

    constructor(private readonly prismaService: PrismaService) {}

    async createBookmark(userId: number, dto: CreateBookmarkDto) {
        const bookmark = await this.prismaService.bookmark.create({
            data: {
                ...dto,
                userId
            }
        });
        return bookmark;
    }

    getBookmarks(userId: number) {
        return this.prismaService.bookmark.findMany({
            where: { userId }
        })
    }

    getBookmarkById(userId: number, bookmarkId: number) {
        return this.prismaService.bookmark.findFirst({
            where: { id: bookmarkId, userId }
        })
    }

    async editBookmarkById(userId: number, bookmarkId: number, dto: EditBookmarkDto) {
        const bookmark = await this.prismaService.bookmark.findUnique({
            where: { id: bookmarkId }
        });
        if(!bookmark || bookmark.userId !== userId) throw new ForbiddenException('Access to resource denied');

        return this.prismaService.bookmark.update({
            where: { id: bookmarkId },
            data: {
                ...dto
            }
        })
    }

    async delteBookmarkById(userId: number, bookmarkId: number) {
        const bookmark = await this.prismaService.bookmark.findUnique({
            where: { id: bookmarkId }
        });
        if(!bookmark || bookmark.userId !== userId) throw new ForbiddenException('Access to resource denied');

        await this.prismaService.bookmark.delete({
            where: { id: bookmarkId }
        })
    }

}
