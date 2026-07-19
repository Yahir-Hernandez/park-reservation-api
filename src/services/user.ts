import { ModelUser } from '../models/local/user';
import { User } from '../types/user';
import { Result } from '../types/errors';

export class UserService {
  static async register(user: User): Result<User> {
    const result = await ModelUser.getAll();
    if (result && 'textCode' in result) {
      return [null, result];
    }
    
    const existingUser = result.find((u) => u.username === user.username);
    if (existingUser) {
        return [null, {
        textCode: 'USERNAME_ALREADY_EXISTS',
        message: `Username ${user.username} already exists`,
      }];
    }
    const existingEmail = result.find((u) => u.email === user.email);
    if (existingEmail) {
      return [null, {
        textCode: 'EMAIL_ALREADY_EXISTS',
        message: `Email ${existingEmail.email} already exists`,
      }];
    }
    // Assign a new ID to the user
    // temporary solution, should be replaced with a real ID generation strategy
    const maxId = result.reduce((max, u) => (u.id > max ? u.id : max), 0);
    user.id = maxId + 1;
    const addResult = await ModelUser.create(user);
    if (addResult && 'textCode' in addResult) {
      return [null, addResult];
    }
    return [user, null];
  }
} 