import fs from 'fs/promises';
import path from 'path';
import { Park} from '../types/park';
import { User } from '../types/user';
import { Reservation } from '../types/reservation';
import { ErrorService } from '../types/errors';

const filePathParks = path.join(__dirname, '../data/parks.json');

// FUNCIÓN: Siempre lee el disco en tiempo real
export const readParksJson = async (): Promise<Park[] | ErrorService> => {
  try {
    try {
      await fs.access(filePathParks);
    } catch {
      return {
        textCode: 'INTERNAL_ERROR',
        message: 'Error reading parks JSON file',
      }; 
    }
    const dataString = await fs.readFile(filePathParks, 'utf-8');
    return JSON.parse(dataString.trim() || '[]') as Park[];
  } catch (error) {
    console.error("Error leyendo JSON:", error);
    return {
      textCode: 'INTERNAL_ERROR',
      message: 'Error reading parks JSON file',
    };
  }
};

// FUNCIÓN: Escribe los cambios en el disco
export const writeParksJson = async (data: Park[]): Promise<Park[] | ErrorService> => {
  try {
    const jsonString = JSON.stringify(data, null, 2);
    await fs.writeFile(filePathParks, jsonString, 'utf-8');
    return data;
  } catch (error) {
    console.error("Error escribiendo JSON:", error);
    return {
      textCode: 'INTERNAL_ERROR',
      message: 'Error writing parks JSON file',
    };
  }
};

const filePathUsers = path.join(__dirname, '../data/usuarios.json');

export const readUsersJson = async (): Promise<User[] | ErrorService> => {
  try {
    try {
      await fs.access(filePathUsers);
    } catch {
      return {
        textCode: 'INTERNAL_ERROR',
        message: 'Error reading users JSON file',
      }; 
    }
    const dataString = await fs.readFile(filePathUsers, 'utf-8');
    return JSON.parse(dataString.trim() || '[]') as User[];
  } catch (error) {
    console.error("Error leyendo JSON:", error);
    return {
      textCode: 'INTERNAL_ERROR',
      message: 'Error reading users JSON file',
    };
  }
};

export const writeUsersJson = async (data: User[]): Promise<User[] | ErrorService> => {
  try {
    const jsonString = JSON.stringify(data, null, 2);
    await fs.writeFile(filePathUsers, jsonString, 'utf-8');
    return data;
  } catch (error) {
    console.error("Error escribiendo JSON:", error);
    return {
      textCode: 'INTERNAL_ERROR',
      message: 'Error writing users JSON file',
    };
  }
};

const filePathReservations = path.join(__dirname, '../data/reservaciones.json');

export const readReservationJson = async (): Promise<Reservation[] | ErrorService> => {
  try {
    try {
      await fs.access(filePathReservations);
    } catch {
      return {
        textCode: 'INTERNAL_ERROR',
        message: 'Error reading reservations JSON file',
      }; 
    }
    const dataString = await fs.readFile(filePathReservations, 'utf-8');
    return JSON.parse(dataString.trim() || '[]') as Reservation[];
  } catch (error) {
    console.error("Error leyendo JSON:", error);
    return {
      textCode: 'INTERNAL_ERROR',
      message: 'Error reading reservations JSON file',
    };
  }
};

export const writeReservationJson = async (data: Reservation[]): Promise<Reservation[] | ErrorService> => {
  try {
    const jsonString = JSON.stringify(data, null, 2);
    await fs.writeFile(filePathReservations, jsonString, 'utf-8');
    return data;
  } catch (error) {
    console.error("Error escribiendo JSON:", error);
    return {
      textCode: 'INTERNAL_ERROR',
      message: 'Error writing reservations JSON file',
    };
  }
};


