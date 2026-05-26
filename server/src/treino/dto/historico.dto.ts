import { IsString, MinLength } from 'class-validator';

export class HistoricoDto {
  @IsString() @MinLength(1)
  diaId: string;

  @IsString() @MinLength(1)
  diaLabel: string;

  @IsString()
  foco: string;
}
