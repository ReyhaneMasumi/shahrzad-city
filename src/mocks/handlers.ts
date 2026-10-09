import { http, HttpResponse, delay } from 'msw';
import mainPage from './data/main-page.json';
import banners from './data/banners.json';

export const handlers = [
  http.get('*/main-page/apps-nested', async () => {
    await delay(200);
    return HttpResponse.json({
      statusCode: 200,
      message: 'OK',
      data: mainPage,
    });
  }),
  http.get('*/banners', async () => {
    await delay(200);
    return HttpResponse.json({
      statusCode: 200,
      message: 'OK',
      data: banners,
    });
  }),
];
