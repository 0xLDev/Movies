import { Request, Response } from "express";
import puppeteer from "puppeteer";
import cheerio from "cheerio";
import { generateStringId } from "../utils/id";

interface MoviesDescription {
  id: string;
  title: string;
  genres: string;
  country: string;
  duration: string;
  description: string;
  staring: string;
  director: string;
  trailerUrl: string;
  age: string;
  img: string;
  cadrs: string[];
}

export const getDescriptionByID = async (req: Request, res: Response) => {
  const { movieID } = req.params;

  // Запустим браузер
  const browser = await puppeteer.launch({
    args: ["--no-sandbox"],
  });

  const description: MoviesDescription[] = [];

  // Откроем новую страницу
  const page = await browser.newPage();
  const pageURL = `https://www.cinemacity.film/films/${movieID}`;

  try {
    // Перейдем по ссылке
    await page.goto(pageURL);

    // Получим контент
    const content = await page.content();

    // Загрузим HTML в cheerio
    const $ = cheerio.load(content);

    // Получаем информацию о фильмах
    // @ts-ignore
    $("section > div.container").each((index, elem) => {
      const movieImage = $(elem)
        .find(
          "div.film-info.film.row > div.d-block.col-12.col-sm-auto > div > img"
        )
        .attr("src");
      const movieRating = $(elem).find(".age-rating").text();
      const movieDuration = $(elem).find("dl > dd:nth-child(4)").text();
      const movieCountry = $(elem).find("dl > dd:nth-child(6)").text();
      const movieTags = $(elem).find("dl > dd:nth-child(8)").text();
      const movieDirector = $(elem).find("dl > dd:nth-child(10)").text();
      const movieSttaring = $(elem).find("dl > dd:nth-child(12)").text();
      const movieTitle = $(elem)
        .find("div.film-info.film.row > div.content.col-12.col-sm > div > h1")
        .text();
      const movieDescription = $(elem).find(".block > .description > p").text();
      const movieTrailer = $(elem)
        .find("div.d-block.col-12.col-sm-auto > button")
        .attr("href");

      const moviesCadrs = Array.from($("a.item")).map(
        (link) => link.attribs.href
      );

      // Отправим информацию о фильмах в массив
      return description.push({
        id: generateStringId(),
        title: movieTitle,
        genres: movieTags.replace(/\r?\n/g, ""),
        country: movieCountry,
        duration: movieDuration,
        description: movieDescription,
        director: movieDirector,
        staring: movieSttaring,
        age: movieRating,
        trailerUrl: movieTrailer,
        img: movieImage,
        cadrs: moviesCadrs,
      });
    });

    // Закрываем вкладку браузера
    await browser.close();
    // // Возвращаем массив
    return res.status(200).json(description);
  } catch (e) {
    // Возвращаем ошибку
    return res.status(500).json({ message: e.message });
  }
};
