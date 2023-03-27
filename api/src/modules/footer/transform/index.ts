import { FooterLanguageEntity } from '../../../entities/footer_language.entity';
import { FooterResponse } from '../interfaces/footer_response.interface';

export const generateData2Object = (footer: FooterLanguageEntity) => {
  if (footer) {
    const payload: FooterResponse = {
      id: footer.id,
      content_id: footer?.content?.id ?? null,
      content: footer?.content?.content,
      language_id: footer.language_id,
    };

    return payload;
  }

  return null;
};
