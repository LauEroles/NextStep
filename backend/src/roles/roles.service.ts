import { Injectable, NotFoundException, ConflictException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { Role } from './entities/role.entity';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
  ) {}

  async create(createRoleDto: CreateRoleDto) {
    const roleExists = await this.roleRepository.findOneBy({ 
      name: createRoleDto.name.toLowerCase() 
    });
    
    if (roleExists) {
      throw new ConflictException('Ese rol ya existe en el sistema');
    }

    const newRole = this.roleRepository.create({ 
      name: createRoleDto.name.toLowerCase() 
    });
    return await this.roleRepository.save(newRole);
  }

  async findAll() {
    return await this.roleRepository.find();
  }

  async findOne(id: number) {
    const role = await this.roleRepository.findOneBy({ id });
    if (!role) {
      throw new NotFoundException(`El rol con id #${id} no existe`);
    }
    return role;
  }

  async findByName(name: string) {
    const role = await this.roleRepository.findOneBy({ name: name.toLowerCase() });
    if (!role) {
      throw new NotFoundException(`El rol '${name}' no existe en la base de datos`);
    }
    return role;
  }

  async findDefaultRole() {
    const role = await this.roleRepository.findOneBy({ isDefault: true });
    
    if (!role) {
      throw new InternalServerErrorException('Error crítico: No hay un rol por defecto configurado en el sistema');
    }
    
    return role;
  }
}
