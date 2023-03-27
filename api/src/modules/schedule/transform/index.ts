import { ScheduleEntity } from '../../../entities/schedule.entity';
import { ScheduleLanguageEntity } from '../../../entities/schedule_language.entity';
import {
  SchedulePagingResponse,
  ScheduleLanguageResponse,
} from '../interfaces/schedule_response.interface';
import { _date, _hour } from '../utils';

export const generateData2Object = (
  schedule_language: ScheduleLanguageEntity,
) => {
  if (schedule_language) {
    const payload: ScheduleLanguageResponse = {
      id: schedule_language.schedule_id,
      schedule_language_id: schedule_language.id,
      title: schedule_language.title,
      slug: schedule_language.slug,
      published: schedule_language.schedule.published,
      content: schedule_language.content,
      date: _date(schedule_language.schedule.timeframe),
      hour: _hour(schedule_language.schedule.timeframe),
      timeframe: schedule_language.schedule.timeframe,
      location: schedule_language.location,
      attendee: schedule_language.attendee,
    };

    return payload;
  }
  return null;
};

export const generateData2Array = (schedules: ScheduleEntity[]) => {
  const payload: SchedulePagingResponse[] = [];

  if (schedules && schedules.length > 0) {
    for (const schedule of schedules) {
      const item: SchedulePagingResponse = {
        id: schedule.id,
        date: _date(schedule.timeframe),
        hour: _hour(schedule.timeframe),
        timeframe: schedule.timeframe,
        title: schedule.schedule_languages[0].title,
        slug: schedule.schedule_languages[0].slug,
        published: schedule.published,
      };
      payload.push(item);
    }
  }

  return payload;
};
