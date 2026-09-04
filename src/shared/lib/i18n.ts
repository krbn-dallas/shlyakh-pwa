import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources={
  uk:{
    translation:{
      nav_home:'Дім', nav_routes:'Маршрути', nav_check:'Чек-листи', nav_more:'Ще',
      sos:'SOS', offline:'офлайн-режим',
      city_kyiv:'Київ', city_chisinau:'Кишинів', city_marrakech:'Марракеш',
      countdown:'До виїзду', today:'Сьогодні', quick_sos:'SOS', quick_check:'Чек-листи', quick_map:'Карта',
      checklist:'Чек-листи', settings:'Налаштування', safety:'Безпека', services:'Сервіси', phrases:'Фрази',
      itinerary:'Маршрут', map:'Карта', places:'Місця', theme:'Тема', lang:'Мова', departure:'Дата виїзду',
    }
  },
  ru:{
    translation:{
      nav_home:'Дом', nav_routes:'Маршруты', nav_check:'Чек-листы', nav_more:'Ещё',
      sos:'SOS', offline:'офлайн-режим',
      city_kyiv:'Киев', city_chisinau:'Кишинёв', city_marrakech:'Марракеш',
      countdown:'До выезда', today:'Сегодня', quick_sos:'SOS', quick_check:'Чек-листы', quick_map:'Карта',
      checklist:'Чек-листы', settings:'Настройки', safety:'Безопасность', services:'Сервисы', phrases:'Фразы',
      itinerary:'Маршрут', map:'Карта', places:'Места', theme:'Тема', lang:'Язык', departure:'Дата выезда',
    }
  }
};
const saved = localStorage.getItem('shlyakh.lang') as 'uk'|'ru'|null;
i18n.use(initReactI18next).init({resources, lng: saved || 'uk', fallbackLng:'uk', interpolation:{escapeValue:false}});
export default i18n;
