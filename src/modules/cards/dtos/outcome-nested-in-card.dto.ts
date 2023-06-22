import {
  IsInt,
  IsNumberString,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export class OutcomeNestedInCardDTO {
  @IsOptional()
  @IsNumberString()
  nextCardId?: string;

  @IsOptional()
  @IsInt()
  @Min(-100)
  @Max(100)
  coffee?: number;

  @IsOptional()
  @IsInt()
  @Min(-100)
  @Max(100)
  personnel?: number;

  @IsOptional()
  @IsInt()
  @Min(-100)
  @Max(100)
  money?: number;

  @IsOptional()
  @IsInt()
  @Min(-100)
  @Max(100)
  customers?: number;
}
