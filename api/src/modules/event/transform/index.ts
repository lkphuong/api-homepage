import { EventEntity } from '../../../entities/event.entity';
import { EventLanguageEntity } from '../../../entities/event_language.entity';
import { EventResponse } from '../interfaces/event_response.interface';

export const generateData2Array = (events: EventEntity[] | null) => {
  const payload: EventResponse[] = [];
  if (events && events.length > 0) {
    for (const event of events) {
      const item: EventResponse = {
        id: event.id,
        title: event.event_languages[0].title,
        slug: event.event_languages[0].slug,
        published: event.published,
        start_date: event.start_date,
        end_date: event.end_date,
      };

      payload.push(item);
    }
  }
  return payload;
};

export const generateData2Object = (
  event_language: EventLanguageEntity | null,
) => {
  if (event_language) {
    const payload: EventResponse = {
      id: event_language.event.id,
      event_language_id: event_language.id,
      title: event_language.title,
      slug: event_language.slug,
      file: event_language.file
        ? {
            id: event_language.file.id,
            name: event_language.file.originalName,
            url: event_language.file.url,
            type: event_language.file.extension,
          }
        : null,
      start_date: event_language.event.start_date,
      end_date: event_language.event.end_date,
      published: event_language.event.published,
    };

    return payload;
  }

  return null;
};
