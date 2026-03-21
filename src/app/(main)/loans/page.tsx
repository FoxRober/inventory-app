import prisma from "@/lib/prisma";
import LoansClient from "./LoansClient";

export default async function LoansPage() {
  const loans = await prisma.loan.findMany({
    include: {
      component: true,
    },
    orderBy: {
      loan_date: "desc",
    },
  });

  return (
    <div className="loans-wrapper">
      <div className="page-header">
        <div>
          <h1>Gestión de Préstamos</h1>
          <p>Controla los componentes prestados, a quién y gestiona sus devoluciones.</p>
        </div>
      </div>
      
      <LoansClient initialLoans={loans} />
    </div>
  );
}
