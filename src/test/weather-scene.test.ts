import {
  buildTaipeiWeatherSnapshot,
  extractCwaCountyScriptData,
  mapWxCodeToVariant,
  pickSceneForPeriod,
} from '../features/weather/cwa-county';

const sampleScript = `
var IssuedTime_36hr = '04/05 11:00';
var TableData_36hr = {
  '63':[
    {'TimeRange':'04/05-12:00 ~ 04/05-18:00','Type':'TD','Temp':{'C':{'L':'25','H':'28'},'F':{'L':'77','H':'82'}},'PoP':'20','Wx_Icon':'05','Wx':'多雲時陰','CI':'舒適'},
    {'TimeRange':'04/05-18:00 ~ 04/06-06:00','Type':'TN','Temp':{'C':{'L':'20','H':'25'},'F':{'L':'68','H':'77'}},'PoP':'60','Wx_Icon':'17','Wx':'陰時多雲短暫陣雨或雷雨','CI':'舒適'},
    {'TimeRange':'04/06-06:00 ~ 04/06-18:00','Type':'TM','Temp':{'C':{'L':'20','H':'27'},'F':{'L':'68','H':'81'}},'PoP':'50','Wx_Icon':'18','Wx':'陰短暫陣雨或雷雨','CI':'舒適'}
  ]
};`;

test('extracts taipei weather from the official county script and derives a scene', () => {
  const dataset = extractCwaCountyScriptData(sampleScript);
  const snapshot = buildTaipeiWeatherSnapshot(dataset);

  expect(snapshot.cityName).toBe('臺北市');
  expect(snapshot.issuedTime).toBe('04/05 11:00');
  expect(snapshot.currentPeriod.wxCode).toBe(5);
  expect(snapshot.activeScene.variantKey).toBe('clear_cloudy');
  expect(snapshot.activeScene.sceneKey).toBe('desert_oasis');
});

test('maps thunderstorm forecast to the ruins scene', () => {
  expect(mapWxCodeToVariant(17)).toBe('thunderstorm');
  expect(
    pickSceneForPeriod({
      wxCode: 17,
      highTemp: 25,
      lowTemp: 20,
      pop: 60,
      type: 'TN',
      weatherText: '陰時多雲短暫陣雨或雷雨',
      comfort: '舒適',
      timeRange: '04/05-18:00 ~ 04/06-06:00',
    }),
  ).toBe('forest_ruins');
});
