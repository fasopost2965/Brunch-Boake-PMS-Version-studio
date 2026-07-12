const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.findUnique({
    where: { email: 'admin@brunchbouake.com' },
    include: { role: { include: { rolePermissions: { include: { permission: true } } } } }
  });
  console.log('User permissions length:', user?.role?.rolePermissions?.length);
  if (user?.role?.rolePermissions) {
    console.log('Permissions:', user.role.rolePermissions.map(rp => rp.permission?.code).join(', '));
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
