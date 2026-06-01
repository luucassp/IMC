import { IsArray, IsInt, IsOptional, IsString } from 'class-validator';

export class GerarTreinoDto {
  @IsString()
  diaId: string;

  @IsString()
  diaFoco: string;

  @IsOptional() @IsString()
  nivel?: string;

  @IsOptional() @IsString()
  objetivo?: string;

  @IsOptional() @IsArray() @IsString({ each: true })
  objetivosExtras?: string[];

  @IsOptional() @IsInt()
  tempoPorTreino?: number;

  @IsOptional() @IsArray() @IsString({ each: true })
  equipamentos?: string[];

  @IsOptional() @IsArray() @IsString({ each: true })
  restricoes?: string[];
}
