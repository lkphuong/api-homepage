import { NotificationEntity } from '../../../entities/notification.entity';
import { NotificationLanguageEntity } from '../../../entities/notification_language.entity';
import { NotificationResponse } from '../interfaces/notification_response.interface';

export const generateData2Array = (
  notifications: NotificationEntity[] | null,
) => {
  const payload: NotificationResponse[] = [];
  if (notifications && notifications.length > 0) {
    for (const notification of notifications) {
      const item: NotificationResponse = {
        id: notification.id,
        title: notification.notification_languages[0].title,
        published: notification.published,
        created_at: notification.created_at,
        updated_at: notification.updated_at,
      };
      payload.push(item);
    }
  }

  return payload;
};

export const generateData2Object = (
  notification_language: NotificationLanguageEntity,
) => {
  if (notification_language) {
    const payload: NotificationResponse = {
      id: notification_language.notification.id,
      notification_language_id: notification_language.id,
      title: notification_language.title,
      published: notification_language.notification.published,
      created_at: notification_language.notification.created_at,
      updated_at: notification_language.notification.updated_at,
    };

    return payload;
  }

  return null;
};
