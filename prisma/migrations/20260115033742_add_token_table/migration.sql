-- CreateTable
CREATE TABLE "Token" (
    "id" CHAR(36) NOT NULL,
    "userId" CHAR(36) NOT NULL,
    "refreshToken" VARCHAR(100) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiredAt" TIMESTAMP(0) NOT NULL,
    "oldRefreshToken" VARCHAR(100),
    "oldExpiredAt" TIMESTAMP(0),

    CONSTRAINT "Token_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Token_refreshToken_key" ON "Token"("refreshToken");

-- CreateIndex
CREATE UNIQUE INDEX "Token_oldRefreshToken_key" ON "Token"("oldRefreshToken");

-- CreateIndex
CREATE INDEX "Token_userId_idx" ON "Token"("userId");

-- CreateIndex
CREATE INDEX "Token_expiredAt_idx" ON "Token"("expiredAt");

-- AddForeignKey
ALTER TABLE "Token" ADD CONSTRAINT "Token_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
