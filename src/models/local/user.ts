import { User, UserFilter } from '../../types/user';
import { readUsersJson, writeUsersJson } from '../../utils/jsonStorage';
import { ErrorService } from '../../types/errors';

export class ModelUser {

  private static matchesFilter(user: User, filter: UserFilter): boolean {
    const activeFilterKeys = Object.keys(filter).filter(
      key => filter[key as keyof UserFilter] !== undefined
    ) as (keyof UserFilter)[];

    return activeFilterKeys.every((key) => {
      const userValue = user[key as keyof User];
      const filterValue = filter[key];

      if (Array.isArray(userValue) && Array.isArray(filterValue)) {
        return filterValue.every(item => userValue.includes(item));
      }

      if (typeof userValue === 'string' && typeof filterValue === 'string') {
        return userValue.toLowerCase().includes(filterValue.toLowerCase());
      }

      return userValue === filterValue;
    });
  }

  static async getAll(): Promise<User[] | ErrorService> {
    return await readUsersJson();
  }

  static async getBy(filter: UserFilter): Promise<User[] | ErrorService> {
    const read = await readUsersJson();
    if (read && 'textCode' in read) return read;

    return read.filter(user => ModelUser.matchesFilter(user, filter));
  }

  static async create(user: User): Promise<User[] | ErrorService> {
    const read = await readUsersJson();
    if (read && 'textCode' in read) return read;

    read.push(user);
    return await writeUsersJson(read);
  }

  static async deleteBy(filter: UserFilter): Promise<User[] | ErrorService> {
    const read = await readUsersJson();
    if (read && 'textCode' in read) return read;

    const updatedUsers = read.filter(user => !ModelUser.matchesFilter(user, filter));

    return await writeUsersJson(updatedUsers);
  }
}