import { IsEmail, IsString, MinLength, MaxLength, Matches, IsNotEmpty } from 'class-validator';
import { Transform } from 'class-transformer';

export class RegisterUserDto {
  @IsEmail({}, { message: 'Некорректный формат email' })
  @Transform(({ value }) => value?.toLowerCase().trim())
  @IsNotEmpty({ message: 'Email обязателен' })
  email!: string;

  @IsString({ message: 'Имя должно быть строкой' })
  @MinLength(2, { message: 'Имя должно содержать минимум 2 символа' })
  @MaxLength(50, { message: 'Имя не должно превышать 50 символов' })
  @Matches(/^[a-zA-Zа-яА-ЯёЁ\s]+$/, { message: 'Имя может содержать только буквы и пробелы' })
  @Transform(({ value }) => value?.trim())
  @IsNotEmpty({ message: 'Имя обязательно' })
  name!: string;

  @IsString({ message: 'Пароль должен быть строкой' })
  @MinLength(8, { message: 'Пароль должен содержать минимум 8 символов' })
  @MaxLength(128, { message: 'Пароль не должен превышать 128 символов' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, {
    message: 'Пароль должен содержать минимум: 1 строчную букву, 1 заглавную букву, 1 цифру и 1 специальный символ'
  })
  @IsNotEmpty({ message: 'Пароль обязателен' })
  password!: string;
}

export class LoginUserDto {
  @IsEmail({}, { message: 'Некорректный формат email' })
  @Transform(({ value }) => value?.toLowerCase().trim())
  @IsNotEmpty({ message: 'Email обязателен' })
  email!: string;

  @IsString({ message: 'Пароль должен быть строкой' })
  @IsNotEmpty({ message: 'Пароль обязателен' })
  password!: string;
}

export class UpdateUserDto {
  @IsString({ message: 'Имя должно быть строкой' })
  @MinLength(2, { message: 'Имя должно содержать минимум 2 символа' })
  @MaxLength(50, { message: 'Имя не должно превышать 50 символов' })
  @Matches(/^[a-zA-Zа-яА-ЯёЁ\s]+$/, { message: 'Имя может содержать только буквы и пробелы' })
  @Transform(({ value }) => value?.trim())
  name?: string;
}
