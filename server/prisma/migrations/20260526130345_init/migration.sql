-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "senhaHash" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Perfil" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "idade" INTEGER,
    "sexo" TEXT,
    "altura" REAL,
    "peso" REAL,
    "objetivo" TEXT,
    "nivel" TEXT,
    "diasPorSemana" INTEGER,
    "tempoPorTreino" INTEGER,
    "equipamentos" TEXT NOT NULL DEFAULT '[]',
    "restricoes" TEXT NOT NULL DEFAULT '[]',
    "atualizadoEm" DATETIME NOT NULL,
    CONSTRAINT "Perfil_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Perfil_userId_key" ON "Perfil"("userId");
