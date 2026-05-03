import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Rodando seed...");

  const passwordHash = await hash("123456", 8);

  await prisma.user.upsert({
    where: { email: "admin@helpdesk.com" },
    update: {},
    create: {
      name: "Admin",
      email: "admin@helpdesk.com",
      password: passwordHash,
      role: "manager",
    },
  });

  const techniciansData = [
    {
      name: "Carlos Silva",
      email: "carlos@helpdesk.com",
      availability: [
        "08:00",
        "09:00",
        "10:00",
        "11:00",
        "14:00",
        "15:00",
        "16:00",
        "17:00",
      ],
    },
    {
      name: "Marcos Lima",
      email: "marcos@helpdesk.com",
      availability: [
        "07:00",
        "08:00",
        "09:00",
        "10:00",
        "13:00",
        "14:00",
        "15:00",
      ],
    },
    {
      name: "Ana Souza",
      email: "ana@helpdesk.com",
      availability: ["10:00", "11:00", "12:00", "18:00", "19:00", "20:00"],
    },
    {
      name: "Fernanda Costa",
      email: "fernanda@helpdesk.com",
      availability: ["08:00", "09:00", "13:00", "14:00", "15:00"],
    },
    {
      name: "João Pereira",
      email: "joao@helpdesk.com",
      availability: ["09:00", "10:00", "11:00", "16:00", "17:00"],
    },
    {
      name: "Lucas Martins",
      email: "lucas@helpdesk.com",
      availability: ["07:00", "08:00", "12:00", "13:00", "18:00"],
    },
    {
      name: "Beatriz Alves",
      email: "beatriz@helpdesk.com",
      availability: ["10:00", "11:00", "14:00", "15:00", "19:00"],
    },
    {
      name: "Rafael Gomes",
      email: "rafael@helpdesk.com",
      availability: ["08:00", "09:00", "10:00", "16:00", "17:00"],
    },
    {
      name: "Juliana Rocha",
      email: "juliana@helpdesk.com",
      availability: ["11:00", "12:00", "13:00", "18:00", "19:00"],
    },
    {
      name: "Bruno Fernandes",
      email: "bruno@helpdesk.com",
      availability: ["07:00", "08:00", "09:00", "14:00", "15:00"],
    },
  ];

  for (const tech of techniciansData) {
    await prisma.user.upsert({
      where: { email: tech.email },
      update: {},
      create: {
        name: tech.name,
        email: tech.email,
        password: passwordHash,
        role: "technical",
        availability: tech.availability,
      },
    });
  }

  const services = [
    { name: "Instalação e atualização de softwares", basePrice: 120 },
    { name: "Instalação e atualização de hardwares", basePrice: 180 },
    { name: "Diagnóstico e remoção de vírus", basePrice: 150 },
    { name: "Suporte a impressoras", basePrice: 90 },
    { name: "Suporte a periféricos", basePrice: 80 },
    {
      name: "Solução de problemas de conectividade de internet",
      basePrice: 110,
    },
    { name: "Backup e recuperação de dados", basePrice: 200 },
    { name: "Otimização de desempenho do sistema operacional", basePrice: 130 },
    { name: "Configuração de VPN e Acesso Remoto", basePrice: 140 },
  ];

  for (const service of services) {
    const existingService = await prisma.service.findFirst({
      where: { name: service.name },
    });

    if (!existingService) {
      await prisma.service.create({
        data: {
          name: service.name,
          basePrice: service.basePrice,
          active: true,
        },
      });
    }
  }

  const customerNames = [
    "João Oliveira",
    "Maria Santos",
    "Pedro Souza",
    "Lucas Ferreira",
    "Gabriel Costa",
    "Rafael Ribeiro",
    "Juliana Mendes",
    "Fernanda Rocha",
    "Beatriz Carvalho",
    "Amanda Alves",
    "Bruno Martins",
    "Camila Barros",
    "Diego Nascimento",
    "Eduardo Batista",
    "Felipe Gomes",
    "Gustavo Teixeira",
    "Helena Duarte",
    "Isabela Freitas",
    "José Henrique",
    "Karina Lopes",
    "Leonardo Pires",
    "Marcelo Cardoso",
    "Natália Campos",
    "Otávio Monteiro",
    "Paula Rezende",
    "Ricardo Farias",
    "Sabrina Vieira",
    "Thiago Azevedo",
    "Vanessa Moura",
    "William Borges",
  ];

  let count = 1;

  for (const name of customerNames) {
    await prisma.user.upsert({
      where: { email: `customer${count}@helpdesk.com` },
      update: {},
      create: {
        name,
        email: `customer${count}@helpdesk.com`,
        password: passwordHash,
        role: "customer",
      },
    });

    count++;
  }
  

  console.log("✅ Seed finalizado!");
}

main()
  .catch(async (e) => {
    console.error("❌ Erro no seed:", e);
    await prisma.$disconnect();
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
