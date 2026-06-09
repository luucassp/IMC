import {
  IsArray,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class PerfilDto {
  @IsOptional() @IsInt() @Min(10) @Max(100)
  idade?: number;

  @IsOptional() @IsString()
  sexo?: string;

  @IsOptional() @IsNumber() @Min(100) @Max(250)
  altura?: number;

  @IsOptional() @IsNumber() @Min(30) @Max(400)
  peso?: number;

  @IsOptional() @IsString()
  objetivo?: string;

  @IsOptional() @IsArray() @IsString({ each: true })
  objetivosExtras?: string[];

  @IsOptional() @IsString()
  enfaseCorporal?: string;

  @IsOptional() @IsString()
  nivel?: string;

  @IsOptional() @IsInt() @Min(1) @Max(7)
  diasPorSemana?: number;

  @IsOptional() @IsInt()
  tempoPorTreino?: number;

  @IsOptional() @IsArray() @IsString({ each: true })
  equipamentos?: string[];

  @IsOptional() @IsArray() @IsString({ each: true })
  restricoes?: string[];
}
