import {
  buildTaipeiWeatherSnapshot,
  buildTownDistrictWeatherSnapshot,
  buildZhongshanDistrictWeatherSnapshot,
  extractCwaCountyScriptData,
  extractCwaTownScriptData,
  mapWxCodeToVariant,
  pickSceneForPeriod,
  resolveCwaTownLocation,
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

const sampleTownThreeHourScript = `
// Updated: 2026/04/06 01:01:02
var Time_3hr = {'C':['01 04/06<br><span>(一)</span>','02 04/06<br><span>(一)</span>']};
var TempArray_3hr = {
  '6300400':{
    'C':{
      'T':[22,23],
      'AT':[25,26]
    },
    'Wx':{'C':[['15','短暫陣雨或雷雨'],['07','陰']]}
  }
};`;

const officialShapeTownThreeHourScript = `
// Updated: 2026/04/08 00:11:02
var Time_3hr = {'C':['01 04/08<br><span>(二)</span>','02 04/08<br><span>(二)</span>','03 04/08<br><span>(二)</span>']};
var TempArray_3hr = {
  '6300400':{
    'C':{
      'T':[21,21,21],
      'AT':[22,22,22]
    },
    'F':{
      'T':[70,70,70],
      'AT':[72,72,72]
    },
    'Wx':{
      'C':[['08','短暫陣雨'],['08','短暫陣雨'],['07','陰']]
    }
  }
};`;

const sampleTownGtScript = `
// Updated: 2026/04/06 01:00:33
var TempArray_GT24hr = {
  '6300400':{
    'C':{
      'T':[19,20,21,22],
      'AT':[21,22,23,24]
    }
  }
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
  expect(
    pickSceneForPeriod(
      {
        wxCode: 17,
        highTemp: 25,
        lowTemp: 20,
        pop: 60,
        type: 'TN',
        weatherText: '陰時多雲短暫陣雨或雷雨',
        comfort: '舒適',
        timeRange: '04/05-18:00 ~ 04/06-06:00',
      },
      0.999,
    ),
  ).toBe('floating_isles');
});

test('extracts Zhongshan district weather from official town scripts', () => {
  const dataset = extractCwaTownScriptData({
    threeHourScript: sampleTownThreeHourScript,
    gt24hrScript: sampleTownGtScript,
  });
  const snapshot = buildZhongshanDistrictWeatherSnapshot(dataset);

  expect(snapshot.cityName).toBe('臺北市中山區');
  expect(snapshot.currentPeriod.wxCode).toBe(15);
  expect(snapshot.currentPeriod.currentTemp).toBe(22);
  expect(snapshot.currentPeriod.feelsLikeTemp).toBe(24);
  expect(snapshot.activeScene.variantKey).toBe('thunderstorm');
});

test('supports the current official town script shape where Wx sits beside C and F', () => {
  const dataset = extractCwaTownScriptData({
    threeHourScript: officialShapeTownThreeHourScript,
    gt24hrScript: sampleTownGtScript,
  });
  const snapshot = buildZhongshanDistrictWeatherSnapshot(dataset);

  expect(snapshot.currentPeriod.wxCode).toBe(8);
  expect(snapshot.currentPeriod.weatherText).toBe('短暫陣雨');
  expect(snapshot.activeScene.variantKey).toBe('rain');
});

test('resolves a current expedition location into a CWA town mapping', () => {
  expect(
    resolveCwaTownLocation({
      city: '臺北市',
      district: '中山區',
    }),
  ).toMatchObject({
    city: '臺北市',
    district: '中山區',
    countyCode: '63',
    townId: '6300400',
  });
});

test('builds a town weather snapshot from the resolved location instead of hard-coded Zhongshan labels', () => {
  const dataset = extractCwaTownScriptData({
    threeHourScript: officialShapeTownThreeHourScript,
    gt24hrScript: sampleTownGtScript,
  });

  const snapshot = buildTownDistrictWeatherSnapshot(
    dataset,
    {
      city: '臺北市',
      district: '中山區',
      countyCode: '63',
      townId: '6300400',
      label: '臺北市中山區',
    },
    0,
  );

  expect(snapshot.cityName).toBe('臺北市中山區');
  expect(snapshot.sourceLabel).toBe('3 小時預報');
  expect(snapshot.currentPeriod.timeRange).toContain('中山區');
});
