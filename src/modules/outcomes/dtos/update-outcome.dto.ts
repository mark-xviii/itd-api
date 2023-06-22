import {
  IsNumber,
  IsNumberString,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class UpdateOutcomeDTO {
  @IsOptional()
  @IsNumber()
  @Min(-100)
  @Max(100)
  coffee?: number;

  @IsOptional()
  @IsNumber()
  @Min(-100)
  @Max(100)
  personnel?: number;

  @IsOptional()
  @IsNumber()
  @Min(-100)
  @Max(100)
  money?: number;

  @IsOptional()
  @IsNumber()
  @Min(-100)
  @Max(100)
  customers?: number;

  @IsOptional()
  @IsNumberString()
  cardId?: string;
}
