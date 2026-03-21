import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding...');

  // Reset data
  await prisma.movement.deleteMany();
  await prisma.loan.deleteMany();
  await prisma.wishlistItem.deleteMany();
  await prisma.component.deleteMany();

  console.log('Deleted old data.');

  // Create components
  const comp1 = await prisma.component.create({
    data: {
      name: 'Resistencia 10k',
      category: 'Resistencias',
      subcategory: '1/4W',
      value: '10kΩ',
      package: 'THT',
      current_quantity: 50,
      unit: 'uds',
      location: 'Caja 1, Gaveta A',
      min_stock: 10,
    },
  });

  const comp2 = await prisma.component.create({
    data: {
      name: 'Capacitor Cerámico',
      category: 'Capacitores',
      value: '100nF',
      package: 'THT',
      current_quantity: 25,
      unit: 'uds',
      location: 'Caja 1, Gaveta B',
      min_stock: 5,
    },
  });

  const comp3 = await prisma.component.create({
    data: {
      name: 'NE555',
      category: 'Circuitos Integrados',
      subcategory: 'Temporizador',
      part_number: 'NE555P',
      package: 'DIP-8',
      current_quantity: 8,
      unit: 'uds',
      location: 'Caja 2',
      min_stock: 5,
      description: 'Temporizador icónico para osciladores',
    },
  });

  const comp4 = await prisma.component.create({
    data: {
      name: 'Transistor NPN',
      category: 'Semiconductores',
      part_number: '2N2222',
      package: 'TO-92',
      current_quantity: 3,
      unit: 'uds',
      location: 'Caja 3',
      min_stock: 10,
    },
  });

  // Create some movements
  await prisma.movement.create({
    data: {
      component_id: comp1.id,
      type: 'COMPRA',
      quantity: 50,
      notes: 'Compra en AliExpress',
    },
  });

  await prisma.movement.create({
    data: {
      component_id: comp3.id,
      type: 'USO',
      quantity: 2,
      notes: 'Proyecto de luces rítmicas',
    },
  });

  // Create a loan
  await prisma.loan.create({
    data: {
      component_id: comp4.id,
      quantity: 2,
      person: 'Carlos Gómez',
      expected_return_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // In 7 days
      notes: 'Para su proyecto final',
    },
  });

  // Create wishlist items
  await prisma.wishlistItem.create({
    data: {
      name: 'ESP32-WROOM-32',
      category: 'Microcontroladores',
      quantity: 5,
      priority: 'ALTA',
      estimated_price: 25.0,
      store: 'Amazon',
      reason: 'Proyectos IoT',
    },
  });

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
