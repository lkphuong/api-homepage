import { BannerEntity } from '../../../entities/banner.entity';
import { BannerLanguageEntity } from '../../../entities/banner_language.entity';
import { BannerResponse } from '../interfaces/banner_response.interface';

export const generateData2Array = (banners: BannerEntity[] | null) => {
  const payload: BannerResponse[] = [];
  if (banners && banners.length > 0) {
    for (const banner of banners) {
      const item: BannerResponse = {
        id: banner.id,
        title: banner.banner_languages[0].title,
        slug: banner.banner_languages[0].slug,
        published: banner.published,
        start_date: banner.start_date,
        end_date: banner.end_date,
      };

      payload.push(item);
    }
  }
  return payload;
};

export const generateData2Object = (
  banner_language: BannerLanguageEntity | null,
) => {
  if (banner_language) {
    const payload: BannerResponse = {
      id: banner_language.banner.id,
      banner_language_id: banner_language.id,
      title: banner_language.title,
      slug: banner_language.slug,
      file: banner_language.file
        ? {
            id: banner_language.file.id,
            name: banner_language.file.originalName,
            url: banner_language.file.url,
            type: banner_language.file.extension,
          }
        : null,
      start_date: banner_language.banner.start_date,
      end_date: banner_language.banner.end_date,
      published: banner_language.banner.published,
    };

    return payload;
  }

  return null;
};
