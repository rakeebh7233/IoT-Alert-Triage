import { prisma } from "../lib/prisma.js";

const users = [
  {
    name: "Rakeeb Hossain",
    role: "building_manager",
    company: "Brookfield Properties",
    bearerToken: "brookfield-manager-token"
  },

  {
    name: "Jalen Brunson",
    role: "technician",
    company: "Brookfield Properties",
    bearerToken: "brookfield-tech-token"
  },

  {
    name: "Sarah Lee",
    role: "operations_manager",
    company: "Brookfield Properties",
    bearerToken: "brookfield-ops-token"
  },

  {
    name: "Micheal Jordan",
    role: "building_manager",
    company: "Mitsui Fudosan",
    bearerToken: "mitsui-manager-token"
  },

  {
    name: "Taylor Swift",
    role: "technician",
    company: "Mitsui Fudosan",
    bearerToken: "mitsui-tech-token"
  }
];

async function main() {

  for (const user of users) {

    await prisma.user.create({
      data: user
    });

    console.log(`Inserted user ${user.name}`);
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {

    console.error(error);

    await prisma.$disconnect();

    process.exit(1);
  });

