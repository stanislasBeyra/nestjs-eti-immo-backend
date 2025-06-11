import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ProprietairesService } from './proprietaires.service';
import { CreateProprietaireDto } from './dto/create-proprietaire.dto';
import { UpdateProprietaireDto } from './dto/update-proprietaire.dto';

@Controller('proprietaires')
export class ProprietairesController {
  constructor(private readonly proprietairesService: ProprietairesService) {}

  @Post()
  create(@Body() createProprietaireDto: CreateProprietaireDto) {
    return this.proprietairesService.create(createProprietaireDto);
  }

  @Get()
  findAll() {
    return this.proprietairesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.proprietairesService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateProprietaireDto: UpdateProprietaireDto) {
    return this.proprietairesService.update(+id, updateProprietaireDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.proprietairesService.remove(+id);
  }
}
