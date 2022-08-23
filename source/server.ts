import http from "http";
import express, { Express, NextFunction, Request, Response } from "express";
import routes from "./routes";
import rateLimit from "express-rate-limit";
import { PORT } from "./config/web";

const router: Express = express();

/** Парсим запрос */
router.use(express.urlencoded({ extended: false }));
/** Получаем в JSON */
router.use(express.json());

/** Правила для API */
router.use((req: Request, res: Response, next: NextFunction) => {
  // Установка политики корса
  res.header("Access-Control-Allow-Origin", "*");
  // Установка заголовок
  res.header(
    "Access-Control-Allow-Headers",
    "origin, X-Requested-With,Content-Type,Accept, Authorization"
  );
  // Установка заголовок
  if (req.method === "OPTIONS") {
    res.header("Access-Control-Allow-Methods", "GET");
    return res.status(200).json({});
  }
  next();
});

/** Роуты */
router.use("/api", routes);

/** Настройка лимита на запросы  */
const limit = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 20,
});

/** Установка лимита */
router.use(limit);

/** Обработка ошибок */
router.use((req: Request, res: Response) => {
  const error = new Error("Произошла ошибка");
  return res.status(404).json({
    message: error.message,
  });
});

/** Запуск сервера */
const httpServer = http.createServer(router);

httpServer.listen(PORT, () =>
  console.log(`Сервер успешно запущен на порту ${PORT}`)
);
