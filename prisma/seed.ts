import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const services = [
    {
      name: "Instalação e atualização de softwares",
      basePrice: 120,
    },
    {
      name: "Instalação e atualização de hardwares",
      basePrice: 180,
    },
    {
      name: "Diagnóstico e remoção de vírus",
      basePrice: 150,
    },
    {
      name: "Suporte a impressoras",
      basePrice: 90,
    },
    {
      name: "Suporte a periféricos",
      basePrice: 80,
    },
    {
      name: "Solução de problemas de conectividade de internet",
      basePrice: 110,
    },
    {
      name: "Backup e recuperação de dados",
      basePrice: 200,
    },
    {
      name: "Otimização de desempenho do sistema operacional",
      basePrice: 130,
    },
    {
      name: "Configuração de VPN e Acesso Remoto",
      basePrice: 140,
    },
  ];

  for (const service of services) {
    const existingService = await prisma.service.findFirst({
      where: {
        name: service.name,
      },
    });

    if (!existingService) {
      await prisma.service.create({
        data: service,
      });
    }
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