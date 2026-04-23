# ==============================================================
#  set-env-dev.ps1 — variáveis de ambiente LOCAL (dev)
#
#  USO:
#    . .\set-env-dev.ps1          (ponto + espaço = carrega no shell atual)
#
#  Este arquivo pode ficar no repositório — não contém segredos.
#  Segredos ficam em set-env-secrets.ps1 (fora do Git).
# ==============================================================

# ── Perfil Spring ──────────────────────────────
$env:APP_PROFILE = "dev"

# ── Banco de dados (Docker local) ─────────────
$env:DB_URL      = "jdbc:mysql://localhost:3307/gestpro?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=America/Sao_Paulo"
$env:DB_USERNAME = "root"
$env:DB_PASSWORD = "5555"

# ── Redis (Docker local) ───────────────────────
$env:SPRING_DATA_REDIS_HOST     = "localhost"
$env:SPRING_DATA_REDIS_PORT     = "6379"
$env:SPRING_DATA_REDIS_PASSWORD = ""

# ── URLs ──────────────────────────────────────
$env:APP_BASE_URL        = "http://localhost:8080"
$env:APP_FRONTEND_URL    = "http://localhost:3000"
$env:NEXT_PUBLIC_API_URL = "http://localhost:8080"

# ── Google OAuth2 — redirect dev ──────────────
$env:GOOGLE_REDIRECT_URI = "http://localhost:8080/login/oauth2/code/google"

# ── Stripe — usar SOMENTE chaves de teste ─────
#  As chaves reais ficam em set-env-secrets.ps1
$env:STRIPE_API_KEY        = ""
$env:STRIPE_WEBHOOK_SECRET = ""

$env:BASIC_AUTH_USER     = "teste"
$env:BASIC_AUTH_PASSWORD = "0000"

Write-Host "✅ Variaveis DEV configuradas." -ForegroundColor Cyan

.\mvnw clean install -DskipTests
java -jar target/gestpro-backend-0.0.1-SNAPSHOT.jar


# ==============================================================
#  EXECUÇÃO — descomente o que precisar
# ==============================================================

# Carrega os segredos (cliente ID, secrets, API keys reais)
# . .\set-env-secrets.ps1

# Build e run
# .\mvnw clean install -DskipTests
# java -jar target/gestpro-backend-0.0.1-SNAPSHOT.jar

# Stripe CLI (só dev)
# .\stripe.exe listen --forward-to localhost:8080/api/payments/webhook
# .\stripe.exe trigger checkout.session.completed --override checkout_session:customer_details.email="seu@email.com"