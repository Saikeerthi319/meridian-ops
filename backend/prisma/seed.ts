import {
  ChallanStatus,
  CustomerStatus,
  CustomerType,
  MovementType,
  PrismaClient,
  Role,
} from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  await prisma.stockMovement.deleteMany();
  await prisma.challanItem.deleteMany();
  await prisma.challan.deleteMany();
  await prisma.followUp.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.product.deleteMany();
  await prisma.documentSequence.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash('Password@123', 10);

  const [admin, sales, warehouse, accounts] = await Promise.all([
    prisma.user.create({
      data: {
        email: 'admin@demo.com',
        name: 'Admin User',
        role: Role.ADMIN,
        passwordHash,
      },
    }),
    prisma.user.create({
      data: {
        email: 'sales@demo.com',
        name: 'Sales User',
        role: Role.SALES,
        passwordHash,
      },
    }),
    prisma.user.create({
      data: {
        email: 'warehouse@demo.com',
        name: 'Warehouse User',
        role: Role.WAREHOUSE,
        passwordHash,
      },
    }),
    prisma.user.create({
      data: {
        email: 'accounts@demo.com',
        name: 'Accounts User',
        role: Role.ACCOUNTS,
        passwordHash,
      },
    }),
  ]);

  const customers = await Promise.all([
    prisma.customer.create({
      data: {
        name: 'Ravi Kumar',
        mobile: '9876500001',
        email: 'ravi@example.com',
        businessName: 'Ravi Traders',
        gstNumber: '29AAAAA0000A1Z5',
        type: CustomerType.WHOLESALE,
        address: 'MG Road, Bengaluru',
        status: CustomerStatus.ACTIVE,
        followUpDate: new Date(),
        notes: 'Prefers morning deliveries',
      },
    }),
    prisma.customer.create({
      data: {
        name: 'Sneha Patel',
        mobile: '9876500002',
        email: 'sneha@example.com',
        businessName: 'Patel Retail',
        type: CustomerType.RETAIL,
        address: 'SG Highway, Ahmedabad',
        status: CustomerStatus.LEAD,
        followUpDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        notes: 'Interested in bulk snacks',
      },
    }),
    prisma.customer.create({
      data: {
        name: 'Arun Nair',
        mobile: '9876500003',
        email: 'arun@example.com',
        businessName: 'Nair Distributors',
        gstNumber: '32BBBBB1111B1Z5',
        type: CustomerType.DISTRIBUTOR,
        address: 'Marine Drive, Kochi',
        status: CustomerStatus.ACTIVE,
      },
    }),
    prisma.customer.create({
      data: {
        name: 'Meera Shah',
        mobile: '9876500004',
        email: 'meera@example.com',
        businessName: 'Shah Stores',
        type: CustomerType.RETAIL,
        address: 'FC Road, Pune',
        status: CustomerStatus.INACTIVE,
      },
    }),
    prisma.customer.create({
      data: {
        name: 'Imran Ali',
        mobile: '9876500005',
        email: 'imran@example.com',
        businessName: 'Ali Wholesale Hub',
        type: CustomerType.WHOLESALE,
        address: 'Charminar, Hyderabad',
        status: CustomerStatus.ACTIVE,
        followUpDate: new Date(Date.now() - 24 * 60 * 60 * 1000),
      },
    }),
    prisma.customer.create({
      data: {
        name: 'Kavya Reddy',
        mobile: '9876500006',
        email: 'kavya@example.com',
        businessName: 'Reddy Mart',
        type: CustomerType.RETAIL,
        address: 'Banjara Hills, Hyderabad',
        status: CustomerStatus.LEAD,
      },
    }),
  ]);

  await prisma.followUp.create({
    data: {
      customerId: customers[0].id,
      note: 'Discussed Q3 volume commitment',
      followUpDate: new Date(),
      createdById: sales.id,
    },
  });

  const products = await Promise.all(
    [
      {
        name: 'Basmati Rice 25kg',
        sku: 'RICE-25',
        category: 'Grains',
        unitPrice: 1800,
        currentStock: 40,
        minStockAlert: 10,
        location: 'Main Warehouse',
      },
      {
        name: 'Sunflower Oil 15L',
        sku: 'OIL-15',
        category: 'Oils',
        unitPrice: 2200,
        currentStock: 8,
        minStockAlert: 12,
        location: 'Main Warehouse',
      },
      {
        name: 'Toor Dal 30kg',
        sku: 'DAL-30',
        category: 'Pulses',
        unitPrice: 3100,
        currentStock: 25,
        minStockAlert: 8,
        location: 'Rack B-2',
      },
      {
        name: 'Sugar 50kg',
        sku: 'SUG-50',
        category: 'Staples',
        unitPrice: 2400,
        currentStock: 5,
        minStockAlert: 10,
        location: 'Main Warehouse',
      },
      {
        name: 'Wheat Flour 10kg',
        sku: 'FLOUR-10',
        category: 'Grains',
        unitPrice: 420,
        currentStock: 60,
        minStockAlert: 15,
        location: 'Rack A-1',
      },
      {
        name: 'Tea Dust 1kg',
        sku: 'TEA-1',
        category: 'Beverages',
        unitPrice: 380,
        currentStock: 35,
        minStockAlert: 10,
        location: 'Rack C-4',
      },
      {
        name: 'Salt 25kg',
        sku: 'SALT-25',
        category: 'Staples',
        unitPrice: 280,
        currentStock: 18,
        minStockAlert: 5,
        location: 'Yard Store',
      },
      {
        name: 'Spice Mix 5kg',
        sku: 'SPC-5',
        category: 'Spices',
        unitPrice: 950,
        currentStock: 12,
        minStockAlert: 6,
        location: 'Rack C-1',
      },
      {
        name: 'Maida 25kg',
        sku: 'MAIDA-25',
        category: 'Grains',
        unitPrice: 1100,
        currentStock: 22,
        minStockAlert: 8,
        location: 'Rack A-3',
      },
      {
        name: 'Groundnut Oil 5L',
        sku: 'OIL-5',
        category: 'Oils',
        unitPrice: 780,
        currentStock: 3,
        minStockAlert: 10,
        location: 'Main Warehouse',
      },
    ].map((p) => prisma.product.create({ data: p })),
  );

  await prisma.stockMovement.createMany({
    data: [
      {
        productId: products[0].id,
        quantity: 40,
        type: MovementType.IN,
        reason: 'Opening stock',
        createdById: warehouse.id,
      },
      {
        productId: products[1].id,
        quantity: 20,
        type: MovementType.IN,
        reason: 'Opening stock',
        createdById: warehouse.id,
      },
      {
        productId: products[1].id,
        quantity: 12,
        type: MovementType.OUT,
        reason: 'Sample dispatch',
        createdById: warehouse.id,
      },
    ],
  });

  const today = new Date();
  const yyyy = today.getUTCFullYear();
  const mm = String(today.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(today.getUTCDate()).padStart(2, '0');
  const datePart = `${yyyy}${mm}${dd}`;

  await prisma.documentSequence.create({
    data: { key: `CHALLAN-${datePart}`, lastValue: 2 },
  });

  const draft = await prisma.challan.create({
    data: {
      challanNumber: `CH-${datePart}-0001`,
      customerId: customers[1].id,
      status: ChallanStatus.DRAFT,
      totalQuantity: 3,
      createdById: sales.id,
      items: {
        create: [
          {
            productId: products[4].id,
            productName: products[4].name,
            sku: products[4].sku,
            unitPrice: products[4].unitPrice,
            quantity: 2,
          },
          {
            productId: products[5].id,
            productName: products[5].name,
            sku: products[5].sku,
            unitPrice: products[5].unitPrice,
            quantity: 1,
          },
        ],
      },
    },
  });

  const confirmedQty = 4;
  const confirmedProduct = products[0];
  await prisma.product.update({
    where: { id: confirmedProduct.id },
    data: { currentStock: confirmedProduct.currentStock - confirmedQty },
  });

  const confirmed = await prisma.challan.create({
    data: {
      challanNumber: `CH-${datePart}-0002`,
      customerId: customers[0].id,
      status: ChallanStatus.CONFIRMED,
      totalQuantity: confirmedQty,
      createdById: sales.id,
      items: {
        create: [
          {
            productId: confirmedProduct.id,
            productName: confirmedProduct.name,
            sku: confirmedProduct.sku,
            unitPrice: confirmedProduct.unitPrice,
            quantity: confirmedQty,
          },
        ],
      },
    },
  });

  await prisma.stockMovement.create({
    data: {
      productId: confirmedProduct.id,
      quantity: confirmedQty,
      type: MovementType.OUT,
      reason: `CHALLAN_CONFIRM ${confirmed.challanNumber}`,
      createdById: sales.id,
      challanId: confirmed.id,
    },
  });

  console.log('Seed complete');
  console.log({
    users: [admin.email, sales.email, warehouse.email, accounts.email],
    password: 'Password@123',
    draftChallan: draft.challanNumber,
    confirmedChallan: confirmed.challanNumber,
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
