import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { LocataireService } from './locataire.service';
import { CreateLocataireDto } from './dto/create-locataire.dto';
import { UpdateLocataireDto } from './dto/update-locataire.dto';

@Controller('locataire')
export class LocataireController {
  constructor(private readonly locataireService: LocataireService) {}

  @Post()
  create(@Body() createLocataireDto: CreateLocataireDto) {
    return this.locataireService.create(createLocataireDto);
  }

  @Get()
  findAll() {
    return this.locataireService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.locataireService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateLocataireDto: UpdateLocataireDto) {
    return this.locataireService.update(+id, updateLocataireDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.locataireService.remove(+id);
  }
}
