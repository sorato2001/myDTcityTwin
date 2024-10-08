import Appconfig from '../config/AppConfig.ts';
const appConfig = new Appconfig();
const conf = './config/application.json';
appConfig.loadConfig(conf);
console.log(appConfig.getConfig());
// const DATA_URL = appConfig.getConfig().ipServer;
const DATA_URL = 'http://192.168.1.21:8083';

const Flood_URL = DATA_URL + '/CityData/flood/0.geojson';
const Floor_URL = DATA_URL + '/CityData/single/楼层.json';
const Roughcast_URL = DATA_URL + '/CityData/roughcast/tileset.json';
const Building_URL = DATA_URL + '/CityData/single/房屋.json';

export { Flood_URL, Floor_URL, Roughcast_URL, Building_URL };
