import { LinkLanguageEntity } from '../../../entities/link_language.entity';
import { ILinksResponse } from '../interfaces/link_response.interface';

export const generateData2Array = (links: LinkLanguageEntity[]) => {
  if (links?.length) {
    return links.map((e) => {
      return <ILinksResponse>{
        id: e.id,
        title: e.title,
        url: e.url,
      };
    });
  }
  return [];
};
