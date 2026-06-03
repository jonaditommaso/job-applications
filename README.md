# Job Applications Tracker

## ¿Por qué existe esto?

Durante mi búsqueda de empleo usaba Google Docs para registrar cada postulación a mano: empresa, puesto, estado, fecha, notas… Era lento, difícil de filtrar y fácil de perder el hilo. Esta app nace de esa necesidad personal: quería algo que me permitiera gestionar mis postulaciones de forma más ágil y visual.

Es la herramienta que uso actualmente en el día a día para llevar el control de mis procesos de selección, con todos los datos relevantes en un solo lugar y una base de datos local en PostgreSQL para que nada salga de mi máquina.

---

## ¿Qué hace la app?

### Funcionalidades principales

- **Registrar postulaciones** con un formulario completo que incluye empresa, puesto, canal de postulación, fecha, notas y modalidad de trabajo.
- **Estados del proceso**: `Postulado`, `Entrevista`, `Prueba técnica`, `Oferta`, `Rechazado`, `Ghosteado`.
- **Filtrar por estado** mediante tabs en la interfaz, y **buscar** por empresa o puesto en tiempo real.
- **Editar cualquier postulación** existente desde la misma vista.
- **Ver el detalle completo** de cada postulación en un diálogo lateral.

### Datos que se registran por postulación

| Campo                        | Descripción                                                 |
| ---------------------------- | ----------------------------------------------------------- |
| Empresa y puesto             | Datos básicos de la oferta                                  |
| Estado                       | Fase actual del proceso                                     |
| Fecha de postulación         | Cuándo se envió la aplicación                               |
| Canal                        | Dónde se encontró la oferta (LinkedIn, web, referido, etc.) |
| Modalidad                    | Remoto, híbrido, mundial o solo UE                          |
| Ubicación                    | País y ciudad                                               |
| CV en inglés                 | Si se envió CV en inglés                                    |
| Inglés requerido             | Si el puesto exige inglés                                   |
| Rango salarial de la empresa | Mínimo y máximo ofrecido                                    |
| Expectativa salarial         | Lo que se pidió                                             |
| Tecnologías requeridas       | Stack principal del puesto                                  |
| Tecnologías valoradas        | Nice to have                                                |
| Candidatos en proceso        | Cuántos hay compitiendo                                     |
| Postulación vista            | Si la empresa ya vio el perfil                              |
| Contactado                   | Si hubo contacto previo                                     |
| Notas                        | Observaciones libres                                        |

### Stack técnico

- **Next.js 15** (App Router) con TypeScript
- **PostgreSQL** local como base de datos (via `pg`)
- **shadcn/ui** para los componentes de interfaz
- **Tailwind CSS** para estilos
- **API Routes** de Next.js para el backend (`/api/applications`)

---

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
