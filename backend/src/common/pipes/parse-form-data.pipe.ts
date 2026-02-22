import { PipeTransform, Injectable, ArgumentMetadata } from '@nestjs/common';

@Injectable()
export class ParseFormDataPipe implements PipeTransform {
  transform(value: unknown, metadata: ArgumentMetadata): unknown {
    if (metadata.type === 'body' && value && typeof value === 'object') {
      const parsed: Record<string, unknown> = {};
      const valueObj = value as Record<string, unknown>;

      for (const key in valueObj) {
        if (Object.prototype.hasOwnProperty.call(valueObj, key)) {
          const val = valueObj[key];
          if (key === 'initialUser' && typeof val === 'string') {
            try {
              parsed[key] = JSON.parse(val) as unknown;
            } catch {
              parsed[key] = val;
            }
          } else if (val === 'true' || val === 'false') {
            parsed[key] = val === 'true';
          } else if (val === '' || val === 'null' || val === 'undefined') {
            parsed[key] = undefined;
          } else {
            parsed[key] = val;
          }
        }
      }

      return parsed;
    }
    return value;
  }
}
