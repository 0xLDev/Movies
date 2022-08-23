import puppeteer from "puppeteer";
import cheerio from "cheerio";
import { generateStringId } from "../utils/id";
import { Request, Response } from "express";

interface MoviesProps {
  id: string;
  movieId: string;
  title: string;
  genres: string;
  country: string;
  duration: string;
  description: string;
  age: string;
  img: string;
}

export const getMovies = async (req: Request, res: Response) => {
  // Запустим браузер
  const browser = await puppeteer.launch({
    args: ["--no-sandbox"],
  });

  const movies: MoviesProps[] = [];

  // Откроем новую страницу
  const page = await browser.newPage();
  const pageURL = "https://www.cinemacity.film/films/";

  try {
    // Перейдем по ссылке
    await page.goto(pageURL);

    // Получим контент
    const content = await page.content();

    // Загрузим HTML в cheerio
    const $ = cheerio.load(content);

    // Получаем информацию о фильмах
    $(".film").each((index, elem): any => {
      const movieID = $(elem)
        .find(".media")
        .attr("href")
        .replace(/^https?\:\/\/|\/$/gi, "")
        .match("^.*\\/(.*)$")[1];

      const movieTitle = $(elem).find(".content > .info > .title").text();
      const movieDescription = $(elem)
        .find(".content > .description > p")
        .text();
      const movieAge = $(elem).find(".media > .age-rating").text();
      const movieTags = $(elem).find(".content > .info > .genres").text();
      const movieCountry = $(elem)
        .find(".content > .info > .details > .item.country")
        .text();
      const movieDuration = $(elem)
        .find(".content > .info > .details > .item.duration")
        .text();
      const movieImage = $(elem).find(".media > img").attr("src");

      // Отправим информацию о фильмах в массив
      return movies.push({
        id: generateStringId(),
        movieId: movieID,
        title: movieTitle,
        genres: movieTags.replace(/\r?\n/g, ""),
        country: movieCountry,
        duration: movieDuration,
        description: movieDescription,
        age: movieAge,
        img: movieImage,
      });
    });

    // Закрываем вкладку браузера
    await browser.close();
    // Возвращаем массив
    return res.status(200).json(movies);
  } catch (e) {
    // Возвращаем ошибку
    return res.status(500).json({ message: e.message });
  }
};
