import fs from 'fs/promises';
import path from 'path';
import { Park} from '../types/park';
import { User } from '../types/user';
import { Reservation } from '../types/reservation';

const filePathParks = path.join(__dirname, '../data/parks.json');

// FUNCIÓN: Siempre lee el disco en tiempo real
export const readParksJson = async (): Promise<Park[]> => {
  try {
    try {
      await fs.access(filePathParks);
    } catch {
      return []; 
    }
    const dataString = await fs.readFile(filePathParks, 'utf-8');
    return JSON.parse(dataString.trim() || '[]') as Park[];
  } catch (error) {
    console.error("Error leyendo JSON:", error);
    return [];
  }
};

// FUNCIÓN: Escribe los cambios en el disco
export const writeParksJson = async (data: Park[]): Promise<void> => {
  try {
    const jsonString = JSON.stringify(data, null, 2);
    await fs.writeFile(filePathParks, jsonString, 'utf-8');
  } catch (error) {
    console.error("Error escribiendo JSON:", error);
  }
};

const filePathUsers = path.join(__dirname, '../data/usuarios.json');

export const readUsersJson = async (): Promise<User[]> => {
  try {
    try {
      await fs.access(filePathUsers);
    } catch {
      return []; 
    }
    const dataString = await fs.readFile(filePathUsers, 'utf-8');
    return JSON.parse(dataString.trim() || '[]') as User[];
  } catch (error) {
    console.error("Error leyendo JSON:", error);
    return [];
  }
};

export const writeUsersJson = async (data: User[]): Promise<void> => {
  try {
    const jsonString = JSON.stringify(data, null, 2);
    await fs.writeFile(filePathUsers, jsonString, 'utf-8');
  } catch (error) {
    console.error("Error escribiendo JSON:", error);
  }
};

const filePathReservations = path.join(__dirname, '../data/reservaciones.json');

export const readReservationJson = async (): Promise<Reservation[]> => {
  try {
    try {
      await fs.access(filePathReservations);
    } catch {
      return []; 
    }
    const dataString = await fs.readFile(filePathReservations, 'utf-8');
    return JSON.parse(dataString.trim() || '[]') as Reservation[];
  } catch (error) {
    console.error("Error leyendo JSON:", error);
    return [];
  }
};

export const writeReservationJson = async (data: Reservation[]): Promise<void> => {
  try {
    const jsonString = JSON.stringify(data, null, 2);
    await fs.writeFile(filePathReservations, jsonString, 'utf-8');
  } catch (error) {
    console.error("Error escribiendo JSON:", error);
  }
};


