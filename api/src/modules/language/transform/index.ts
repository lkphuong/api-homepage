import { LanguageEntity } from '../../../entities/language.entity';
import { LanguageResponse } from '../interfaces/language_response.interface';

export const generateData2Array = (languages: LanguageEntity[]) => {
  const payload: LanguageResponse[] = [];
  if (languages && languages.length > 0) {
    for (const language of languages) {
      const item: LanguageResponse = {
        id: language.id,
        code: language.code,
        name: language.name,
        slug: language.slug,
        created_at: language.created_at,
        updated_at: language.updated_at,
      };
      payload.push(item);
    }
  }
  return payload;
};

export const generateData2Object = (language: LanguageEntity) => {
  const { id, code, name, slug, created_at, updated_at } = language;
  const payload: LanguageResponse = {
    id,
    code,
    name,
    slug,
    created_at,
    updated_at,
  };
  return payload;
};
