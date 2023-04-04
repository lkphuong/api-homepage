import { Request } from 'express';
import { LinkService } from '../services/link.service';

import { LinksDto } from '../dtos/update_link.dto';

import { UnknownException } from '../../../exceptions/UnknownException';

import { DATABASE_EXIT_CODE } from '../../../constants/enums/error_code.enum';
import { ErrorMessage } from '../constants/enums/errors.enum';

export const validateLinks = async (
  params: LinksDto,
  link_service: LinkService,
  req: Request,
) => {
  const { links } = params;
  if (links?.length) {
    const link_ids = links.map((e) => {
      return e.id;
    });
    if (links.length === link_ids.length) {
      //#region get links
      const links = await link_service.contains(link_ids);
      //#endregion
      if (links) {
        return links;
      }
    }
    //#region throw HandlerException
    return new UnknownException(
      link_ids,
      DATABASE_EXIT_CODE.UNKNOW_VALUE,
      req.method,
      req.url,
      ErrorMessage.LINK_NOT_FOUND_ERROR,
    );
    //#endregion
  }
};
