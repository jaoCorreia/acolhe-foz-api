import { applyDecorators } from '@nestjs/common';
import { Matches } from 'class-validator';

// UUID no formato hexadecimal (8-4-4-4-12), SEM exigir o bit de variante
// RFC-4122. O @IsUUID() do class-validator rejeita os IDs determinísticos
// do seed (ex.: 1111...-1101, 3333...-3302), que o PostgreSQL aceita
// normalmente no tipo `uuid`. Este validador aceita ambos.
export const LENIENT_UUID =
  /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;

export function IsUuidLike(field = 'campo') {
  return applyDecorators(
    Matches(LENIENT_UUID, { message: `${field} deve ser um UUID válido` }),
  );
}
