-- CreateTable
CREATE TABLE "Historico" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "diaId" TEXT NOT NULL,
    "diaLabel" TEXT NOT NULL,
    "foco" TEXT NOT NULL,
    "data" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Historico_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Registro" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "exercicio" TEXT NOT NULL,
    "carga" REAL NOT NULL,
    "reps" INTEGER NOT NULL,
    "data" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Registro_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "Historico_userId_idx" ON "Historico"("userId");

-- CreateIndex
CREATE INDEX "Registro_userId_idx" ON "Registro"("userId");
