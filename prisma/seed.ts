import { userModel } from '../src/models/user';
import { parkModel } from '../src/models/park';
import { cabinModel } from '../src/models/cabin';
import { reservationModel } from '../src/models/reservation';
import { prisma } from '../src/db/config';

async function main() {
  console.log('🌱 Agregando nuevos datos con tus modelos...');

  // =========================================================
  // 1. Nuevos Usuarios
  // =========================================================
  console.log('👥 Creando nuevos usuarios...');

  const resUser1 = await userModel.create({
    name: 'Marta',
    lastname: 'Sánchez',
    username: 'msanchez',
    email: 'marta.sanchez@email.com',
    passwordHash: '$2a$10$wK1e.EXAMPLE_HASH_HERE',
    role: 'cliente',
  });

  const resUser2 = await userModel.create({
    name: 'Roberto',
    lastname: 'Gómez',
    username: 'robertg',
    email: 'roberto.gomez@email.com',
    passwordHash: '$2a$10$wK1e.EXAMPLE_HASH_HERE',
    role: 'cliente',
  });

  const resAdmin2 = await userModel.create({
    name: 'Lucía',
    lastname: 'Mendoza',
    username: 'luciam',
    email: 'lucia.admin@parques.com',
    passwordHash: '$2a$10$wK1e.EXAMPLE_HASH_HERE',
    role: 'administrador',
  });

  if (!resUser1.ok || !resUser2.ok || !resAdmin2.ok) {
    throw new Error('Error al crear los nuevos usuarios');
  }

  const marta = resUser1.data;
  const roberto = resUser2.data;

  // =========================================================
  // 2. Nuevos Parques
  // =========================================================
  console.log('🌲 Creando nuevos parques...');

  // Parque 3: Parque en la costa / lago
  const resPark3 = await parkModel.create({
    name: 'Parque Nacional Lago Azul',
    location: 'Carretera Costera Km 88',
    services: ['Kayaks', 'Pesca', 'Restaurante', 'Wifi', 'Estacionamiento'],
    openingTime: new Date('1970-01-01T07:00:00Z'),
    closingTime: new Date('1970-01-01T19:00:00Z'),
    latitude: 20.659698 as any,
    longitude: -103.349609 as any,
    startSeason: new Date('2026-02-01'),
    endSeason: new Date('2026-11-30'),
    closeDays: ['Martes'],
    hasCabins: true,
    capacityCamping: 80,
  });

  // Parque 4: Parque volcánico / alta montaña
  const resPark4 = await parkModel.create({
    name: 'Reserva Cumbres del Nevado',
    location: 'Paso de Montaña Km 104',
    services: ['Guías de Montaña', 'Primeros Auxilios', 'Asadores', 'Mirador'],
    openingTime: new Date('1970-01-01T05:30:00Z'),
    closingTime: new Date('1970-01-01T17:30:00Z'),
    latitude: 19.100500 as any,
    longitude: -98.600100 as any,
    startSeason: new Date('2026-01-15'),
    endSeason: new Date('2026-12-15'),
    closeDays: ['Miércoles'],
    hasCabins: true,
    capacityCamping: 30,
  });

  if (!resPark3.ok || !resPark4.ok) {
    throw new Error('Error al crear los nuevos parques');
  }

  const parqueLago = resPark3.data;
  const parqueNevado = resPark4.data;

  // =========================================================
  // 3. Nuevas Cabañas
  // =========================================================
  console.log('🏡 Creando nuevas cabañas...');

  // Cabañas en Parque Lago Azul
  const resCab1 = await cabinModel.create({
    name: 'Cabaña La Garza',
    parkId: parqueLago.id,
    capacity: 2,
  });

  const resCab2 = await cabinModel.create({
    name: 'Cabaña El Pelícano VIP',
    parkId: parqueLago.id,
    capacity: 8,
  });

  // Cabañas en Cumbres del Nevado
  const resCab3 = await cabinModel.create({
    name: 'Refugio del Cóndor',
    parkId: parqueNevado.id,
    capacity: 5,
  });

  if (!resCab1.ok || !resCab2.ok || !resCab3.ok) {
    throw new Error('Error al crear las nuevas cabañas');
  }

  const cabanaGarza = resCab1.data;
  const refugioCondor = resCab3.data;

  // =========================================================
  // 4. Nuevas Reservaciones
  // =========================================================
  console.log('📅 Creando nuevas reservaciones...');

  // Reservación activa en cabaña (Lago Azul)
  const resReserva1 = await reservationModel.create({
    userId: marta.id,
    parkId: parqueLago.id,
    cabinId: cabanaGarza.id,
    startDate: new Date('2026-10-05'),
    endDate: new Date('2026-10-08'),
    people: 2,
    visitType: 'cabaña',
    status: 'activa',
  });

  // Reservación para camping (Nevado)
  const resReserva2 = await reservationModel.create({
    userId: roberto.id,
    parkId: parqueNevado.id,
    cabinId: null,
    startDate: new Date('2026-11-12'),
    endDate: new Date('2026-11-14'),
    people: 4,
    visitType: 'camping',
    status: 'activa',
  });

  // Reservación cancelada (Refugio del Cóndor)
  const resReserva3 = await reservationModel.create({
    userId: roberto.id,
    parkId: parqueNevado.id,
    cabinId: refugioCondor.id,
    startDate: new Date('2026-12-01'),
    endDate: new Date('2026-12-05'),
    people: 5,
    visitType: 'cabaña',
    status: 'cancelada',
  });

  if (!resReserva1.ok || !resReserva2.ok || !resReserva3.ok) {
    throw new Error('Error al crear las nuevas reservaciones');
  }

  // =========================================================
  // 5. Verificación de Totales
  // =========================================================
  console.log('🔍 Verificando totales acumulados...');
  const users = await userModel.getAll();
  const parks = await parkModel.getAll();
  const cabins = await cabinModel.getAll();
  const reservations = await reservationModel.getAll();

  if (users.ok && parks.ok && cabins.ok && reservations.ok) {
    console.log('----------------------------------------------------');
    console.log(`✅ Base de datos actualizada con éxito!`);
    console.log(`👤 Total Usuarios:      ${users.data.length}`);
    console.log(`🌲 Total Parques:       ${parks.data.length}`);
    console.log(`🏡 Total Cabañas:       ${cabins.data.length}`);
    console.log(`📅 Total Reservaciones: ${reservations.data.length}`);
    console.log('----------------------------------------------------');
  }
}

main()
  .catch((e) => {
    console.error('❌ Error al insertar nuevos datos:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });