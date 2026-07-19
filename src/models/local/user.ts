import { User, UserFilter } from '../../types/user';
import { readUsersJson, writeUsersJson } from '../../utils/jsonStorage';

export class UserModel {

  static async getAll(): Promise<User[]> {
    return readUsersJson();
  }

  static async getBy(filter: UserFilter): Promise<User[]> {
    const users = await readUsersJson();
    return users.filter((user) => {
      const activeFilterKeys = Object.keys(filter).filter(
        key => filter[key as keyof UserFilter] !== undefined
      );

      return activeFilterKeys.every((key) => {
        const userValue = user[key as keyof User];
        const filterValue = filter[key as keyof UserFilter];

        if (Array.isArray(userValue) && Array.isArray(filterValue)) {
          return filterValue.every(item => userValue.includes(item));
        }

        if (typeof userValue === 'string' && typeof filterValue === 'string') {
          return userValue.toLowerCase().includes(filterValue.toLowerCase());
        }

        return userValue === filterValue;
      });
    });
  }

  static async add(user: User): Promise<void> {
    const users = await readUsersJson();
    users.push(user);
    await writeUsersJson(users);
  }

  static async deleteBy(filter: UserFilter): Promise<void> {
    const activeFilterKeys = Object.keys(filter).filter(
      key => filter[key as keyof UserFilter] !== undefined
    );

    await writeUsersJson(
      (await readUsersJson()).filter((user) => {  
        return !activeFilterKeys.every((key) => {
          const userValue = user[key as keyof User];
          const filterValue = filter[key as keyof UserFilter];

          if (Array.isArray(userValue) && Array.isArray(filterValue)) {
            return filterValue.every(item => userValue.includes(item));
          }

          if (typeof userValue === 'string' && typeof filterValue === 'string') {
            return userValue.toLowerCase().includes(filterValue.toLowerCase());
          }

          return userValue === filterValue;
        });
      })
    );
  }
}