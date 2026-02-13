import { Controller, Body, Param, Post, Get, HttpStatus, HttpCode } from "@nestjs/common";
import { VideosService } from "./videos.service";
import { Role } from "../../constants/role.enum";
import { Roles, User } from "../../common/decorators";
import { ValidateIdentifierPipe } from "../../common/pipes";
import { JwtPayload } from "../../types";


@Controller('videos')
@Roles(Role.User, Role.Admin)
export class VideosUserController {
    constructor(private readonly videosService: VideosService) { }

    @Get(':id/interaction-status')
    @HttpCode(HttpStatus.OK)
    async getInteractionStatus(
        @Param('id', ValidateIdentifierPipe) id: string,
        @User() user: JwtPayload
    ) {
        return this.videosService.getInteractionStatus(id, user.sub);
    }

    @Post(':id/view')
    @HttpCode(HttpStatus.NO_CONTENT)
    async updateView(
        @Param('id', ValidateIdentifierPipe) id: string,
        @Body('watch_position') watchPosition?: number,
        @User() user?: JwtPayload,
    ) {
        await this.videosService.updateView(id, user?.sub, watchPosition);
    }

    @Post(':id/like')
    @HttpCode(HttpStatus.OK)
    async like(
        @Param('id', ValidateIdentifierPipe) id: string,
        @User() user: JwtPayload
    ) {
        return this.videosService.like(id, user.sub);
    }
}
