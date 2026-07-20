import fs from 'fs/promises';
import path from 'path';
import { Park} from '../types/park';
import { User } from '../types/user';
import { Reservation } from '../types/reservation';
import { Cabin } from '../types/cabin';
import {  Result } from '../types/errors';

const filePathParks = path.join(__dirname, '../data/parks.json');
const filePathUsers = path.join(__dirname, '../data/usuarios.json');
const filePathReservations = path.join(__dirname, '../data/reservaciones.json');
const filePathCabins = path.join(__dirname, '../data/cabanas.json');

async function readJson<T>(filePath: string): Promise<Result<T[]>> {
  try {
    await fs.access(filePath);
    const data = await fs.readFile(filePath, "utf-8");
    return {
      ok: true,
      data: JSON.parse(data.trim() || "[]") as T[],
    };
  } catch (error) {
    console.error("Error leyendo JSON:", error);
    return {
      ok: false,
      error: {
        status: 500,
        textCode: 'INTERNAL_ERROR',
        message: 'Error reading JSON file: ' + filePath,
      },
    };
  }
}

async function writeJson<T>(filePath: string, data: T[]): Promise<Result<T[]>> {
  try {
    const jsonString = JSON.stringify(data, null, 2);
    await fs.writeFile(filePath, jsonString, 'utf-8');
    return {
      ok: true,
      data,
    };
  } catch (error) {
    console.error("Error escribiendo JSON:", error);
    return {
      ok: false,
      error: {
        status: 500,
        textCode: 'INTERNAL_ERROR',
        message: 'Error writing JSON file: ' + filePath,
      },
    };
  }
}

export const getParks = () => readJson<Park>(filePathParks);
export const saveParks = (data: Park[]) => writeJson<Park>(filePathParks, data);

export const getUsers = () => readJson<User>(filePathUsers);
export const saveUsers = (data: User[]) => writeJson<User>(filePathUsers, data);

export const getReservations = () => readJson<Reservation>(filePathReservations);
export const saveReservations = (data: Reservation[]) => writeJson<Reservation>(filePathReservations, data);

export const getCabins = () => readJson<Cabin>(filePathCabins);
export const saveCabins = (data: Cabin[]) => writeJson<Cabin>(filePathCabins, data);