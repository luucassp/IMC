import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class GerarTreinoIaDto {
  @IsOptional() @IsString()
  fadiga?: string;

  @IsOptional() @IsString()
  diaId?: string;

  @IsOptional() @IsString()
  diaFoco?: string;

  @IsOptional() @IsBoolean()
  force?: boolean;
}
