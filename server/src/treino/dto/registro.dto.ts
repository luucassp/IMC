import { IsInt, IsNumber, IsString, Min, MinLength } from 'class-validator';

export class RegistroDto {
  @IsString() @MinLength(1)
  exercicio: string;

  @IsNumber() @Min(0)
  carga: number;

  @IsInt() @Min(1)
  reps: number;
}
