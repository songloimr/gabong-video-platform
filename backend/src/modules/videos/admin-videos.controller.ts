import { Controller, Delete, Put, Body, Param, Patch, Get, Query } from "@nestjs/common";
import { VideosService } from "./videos.service";

import { UpdateVideoDto } from "./dto";
import { Role } from "../../constants/role.enum";
import { Roles } from "../../common/decorators";
import { ValidateIdentifierPipe } from "../../common/pipes";

@Controller('videos')
export class VideosAdminController {
    constructor(private readonly videosService: VideosService) { }

    @Put(':id')
    @Roles(Role.Admin)
    async update(
        @Param('id', ValidateIdentifierPipe) id: string,
        @Body() dto: UpdateVideoDto,
    ) {
        return this.videosService.update(id, dto);
    }

    @Delete(':id')
    @Roles(Role.Admin)
    async delete(
        @Param('id', ValidateIdentifierPipe) id: string,
    ) {
        return this.videosService.delete(id);    
    }

    @Patch(':id/pin')
    @Roles(Role.Admin)
    async pin(@Param('id', ValidateIdentifierPipe) id: string) {
        return this.videosService.pinVideo(id);
    }

    @Patch(':id/unpin')
    @Roles(Role.Admin)
    async unpin(@Param('id', ValidateIdentifierPipe) id: string) {
        return this.videosService.unpinVideo(id);
    }
}
