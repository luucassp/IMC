import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class GerarTreinoIaDto {
  @IsOptional() @IsString()
  fadiga?: string;

  @IsOptional() @IsBoolean()
  force?: boolean;
}
