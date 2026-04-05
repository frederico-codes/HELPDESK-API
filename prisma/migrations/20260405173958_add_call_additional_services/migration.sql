-- CreateTable
CREATE TABLE "call_additional_services" (
    "id" TEXT NOT NULL,
    "callId" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "call_additional_services_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "call_additional_services" ADD CONSTRAINT "call_additional_services_callId_fkey" FOREIGN KEY ("callId") REFERENCES "calls"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "call_additional_services" ADD CONSTRAINT "call_additional_services_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "services"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
