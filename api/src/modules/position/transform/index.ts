import { PositionEntity } from '../../../entities/position.entity';
import { PositionLanguageEntity } from '../../../entities/position_language.entity';
import { PositionResponse } from '../interfaces/position_response.interface';

export const generateData2Array = (positions: PositionEntity[] | null) => {
  const payload: PositionResponse[] = [];
  if (positions && positions.length > 0) {
    for (const position of positions) {
      const item: PositionResponse = {
        id: position.id,
        title: position.position_languages[0].title,
        slug: position.position_languages[0].slug,
        published: position.published,
        created_at: position.created_at,
        updated_at: position.updated_at,
      };
      payload.push(item);
    }
  }

  return payload;
};

export const generateData2Object = (
  position_language: PositionLanguageEntity,
) => {
  if (position_language) {
    const payload: PositionResponse = {
      id: position_language.position.id,
      position_language_id: position_language.id,
      title: position_language.title,
      slug: position_language.slug,
      published: position_language.position.published,
      created_at: position_language.position.created_at,
      updated_at: position_language.position.updated_at,
    };

    return payload;
  }

  return null;
};
