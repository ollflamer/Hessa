import { IsEmail, IsString, MinLength, MaxLength, IsNotEmpty, IsOptional, IsIn, IsUUID } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateFeedbackDto {
  @IsString({ message: 'Имя должно быть строкой' })
  @IsNotEmpty({ message: 'Имя обязательно' })
  @MinLength(2, { message: 'Имя должно быть минимум 2 символа' })
  @MaxLength(100, { message: 'Имя не должно превышать 100 символов' })
  @Transform(({ value }) => value?.trim())
  name!: string;

  @IsEmail({}, { message: 'Некорректный формат email' })
  @Transform(({ value }) => value?.toLowerCase()?.trim())
  email!: string;

  @IsString({ message: 'Текст сообщения должен быть строкой' })
  @IsNotEmpty({ message: 'Текст сообщения обязателен' })
  @MinLength(10, { message: 'Сообщение должно быть минимум 10 символов' })
  @MaxLength(2000, { message: 'Сообщение не должно превышать 2000 символов' })
  @Transform(({ value }) => value?.trim())
  text!: string;
}

export class FeedbackResponseDto {
  @IsString({ message: 'Ответ должен быть строкой' })
  @IsNotEmpty({ message: 'Ответ обязателен' })
  @MinLength(5, { message: 'Ответ должен быть минимум 5 символов' })
  @MaxLength(2000, { message: 'Ответ не должен превышать 2000 символов' })
  @Transform(({ value }) => value?.trim())
  response!: string;
}

export class FeedbackFiltersDto {
  @IsOptional()
  @IsIn(['pending', 'in_progress', 'answered', 'closed'], { 
    message: 'Статус должен быть одним из: pending, in_progress, answered, closed' 
  })
  status?: string;

  @IsOptional()
  @IsEmail({}, { message: 'Некорректный формат email' })
  @Transform(({ value }) => value?.toLowerCase()?.trim())
  email?: string;

  @IsOptional()
  @IsString({ message: 'Дата должна быть строкой' })
  dateFrom?: string;

  @IsOptional()
  @IsString({ message: 'Дата должна быть строкой' })
  dateTo?: string;

  @IsOptional()
  @Transform(({ value }) => parseInt(value) || 20)
  limit?: number = 20;

  @IsOptional()
  @Transform(({ value }) => parseInt(value) || 0)
  offset?: number = 0;
}

export class UpdateFeedbackStatusDto {
  @IsIn(['pending', 'in_progress', 'answered', 'closed'], { 
    message: 'Статус должен быть одним из: pending, in_progress, answered, closed' 
  })
  status!: string;
}
