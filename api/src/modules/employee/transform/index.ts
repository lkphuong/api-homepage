import { EmployeeEntity } from '../../../entities/employee.entity';
import { EmployeeLanguageEntity } from '../../../entities/employee_language.entity';
import {
  EmployeeLanguageResponse,
  EmployeePagingResponse,
} from '../interfaces/employee_response.interface';

export const generateData2Array = (employees: EmployeeEntity[] | null) => {
  const payload: EmployeePagingResponse[] = [];
  if (employees && employees.length > 0) {
    for (const employee of employees) {
      const item: EmployeePagingResponse = {
        id: employee.id,
        name: employee.employee_languages[0].name,
        slug: employee.employee_languages[0].slug,
        published: employee.published,
        academic_degree: employee.employee_languages[0].academic_degree,
        created_at: employee.created_at,
      };

      payload.push(item);
    }
  }
  return payload;
};

export const generateData2Object = (
  employee_language: EmployeeLanguageEntity | null,
) => {
  if (employee_language) {
    const payload: EmployeeLanguageResponse = {
      id: employee_language.employee.id,
      employee_language_id: employee_language.id,
      name: employee_language.name,
      slug: employee_language.slug,
      file: employee_language.file
        ? {
            id: employee_language.file.id,
            name: employee_language.file.originalName,
            url: employee_language.file.url,
            type: employee_language.file.extension,
          }
        : null,
      published: employee_language.employee.published,
      academic_degree: employee_language.academic_degree,
    };

    return payload;
  }

  return null;
};
