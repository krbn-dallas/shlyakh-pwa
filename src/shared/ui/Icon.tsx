import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import type { IconProp } from '@fortawesome/fontawesome-svg-core';
import {
  faArrowLeft, faArrowRight, faArrowRotateRight, faArrowUpRightFromSquare, faBagShopping,
  faBan, faBars, faBed, faBell, faBolt, faBook, faBoxArchive, faBriefcaseMedical, faBug,
  faBuildingColumns, faBus, faCalendarDays, faCamera, faCartShopping, faCheck, faCheckDouble,
  faChevronDown, faChevronLeft, faChevronRight, faChevronUp, faCircleCheck, faCircleExclamation,
  faCircleHalfStroke, faCircleInfo, faCircleQuestion, faClock, faCloudArrowDown, faCommentDots,
  faCompass, faCopy, faCreditCard, faCrosshairs, faDownload, faDroplet, faEarthAfrica, faEye,
  faFilePdf, faFileLines, faFilter, faFire, faFlag, faGlassWater, faGlobe, faGraduationCap,
  faHandHoldingHeart, faHandshake, faHeart, faHouse, faHouseChimney, faIdCard, faKey,
  faLanguage, faLightbulb, faLocationCrosshairs, faLocationDot, faLock, faMagnifyingGlass,
  faMapLocationDot, faMartiniGlassCitrus, faMinus, faMobileScreen, faMoon, faMosque, faMountainSun,
  faMugHot, faPalette, faPassport, faPersonWalking, faPhone, faPills, faPlaneDeparture, faPlug,
  faPlus, faPrescriptionBottleMedical, faRotate, faRoute, faSackDollar, faShareNodes, faShield,
  faShieldHalved, faShirt, faShop, faSpinner, faStar, faSquarePlus, faSuitcase, faSuitcaseRolling,
  faSun, faTaxi, faTemperatureHalf, faTrainSubway, faTrash, faTriangleExclamation, faUmbrellaBeach,
  faUser, faUserGroup, faUsers, faUtensils, faVenus, faWallet, faWandMagicSparkles, faWifi,
  faXmark, faStore, faScaleBalanced, faBellConcierge, faKitMedical, faSocks, faBaby,
} from '@fortawesome/free-solid-svg-icons';
import { faCircle, faSquare, faSquareCheck, faStar as faStarO, faClock as faClockO } from '@fortawesome/free-regular-svg-icons';

/**
 * One place where icon names become icons. Font Awesome free (same set as the
 * account kit 897bb67939) but bundled and tree-shaken, so icons render offline.
 * To move to a Pro kit later, only this file changes.
 */
const REGISTRY = {
  'arrow-left': faArrowLeft, 'arrow-right': faArrowRight, 'arrow-rotate-right': faArrowRotateRight,
  'external': faArrowUpRightFromSquare, 'bag': faBagShopping, ban: faBan, bars: faBars, bed: faBed,
  bell: faBell, bolt: faBolt, book: faBook, archive: faBoxArchive, 'medical-bag': faBriefcaseMedical,
  bug: faBug, museum: faBuildingColumns, bus: faBus, calendar: faCalendarDays, camera: faCamera,
  cart: faCartShopping, check: faCheck, 'check-double': faCheckDouble, 'chevron-down': faChevronDown,
  'chevron-left': faChevronLeft, 'chevron-right': faChevronRight, 'chevron-up': faChevronUp,
  'circle-check': faCircleCheck, 'circle-exclamation': faCircleExclamation, contrast: faCircleHalfStroke,
  info: faCircleInfo, question: faCircleQuestion, clock: faClock, 'cloud-download': faCloudArrowDown,
  comment: faCommentDots, compass: faCompass, copy: faCopy, card: faCreditCard, crosshairs: faCrosshairs,
  download: faDownload, droplet: faDroplet, africa: faEarthAfrica, eye: faEye, pdf: faFilePdf,
  file: faFileLines, filter: faFilter, fire: faFire, flag: faFlag, water: faGlassWater, globe: faGlobe,
  learn: faGraduationCap, care: faHandHoldingHeart, handshake: faHandshake, heart: faHeart,
  home: faHouse, house: faHouseChimney, id: faIdCard, key: faKey, language: faLanguage,
  tip: faLightbulb, locate: faLocationCrosshairs, pin: faLocationDot, lock: faLock,
  search: faMagnifyingGlass, map: faMapLocationDot, drink: faMartiniGlassCitrus, minus: faMinus,
  phone_app: faMobileScreen, moon: faMoon, mosque: faMosque, mountain: faMountainSun, cafe: faMugHot,
  palette: faPalette, passport: faPassport, walk: faPersonWalking, phone: faPhone, pills: faPills,
  plane: faPlaneDeparture, plug: faPlug, plus: faPlus, medicine: faPrescriptionBottleMedical,
  rotate: faRotate, route: faRoute, money: faSackDollar, share: faShareNodes, shield: faShield,
  'shield-half': faShieldHalved, shirt: faShirt, shop: faShop, spinner: faSpinner, star: faStar,
  'square-plus': faSquarePlus, suitcase: faSuitcase, luggage: faSuitcaseRolling, sun: faSun,
  taxi: faTaxi, temperature: faTemperatureHalf, train: faTrainSubway, trash: faTrash,
  warn: faTriangleExclamation, beach: faUmbrellaBeach, user: faUser, couple: faUserGroup,
  users: faUsers, food: faUtensils, venus: faVenus, wallet: faWallet, magic: faWandMagicSparkles,
  wifi: faWifi, x: faXmark, store: faStore, scale: faScaleBalanced, concierge: faBellConcierge,
  kit: faKitMedical, socks: faSocks, baby: faBaby,
  'o-circle': faCircle, 'o-square': faSquare, 'o-check': faSquareCheck, 'o-star': faStarO,
  'o-clock': faClockO,
} satisfies Record<string, IconProp>;

export type IconName = keyof typeof REGISTRY;
export const isIconName = (n: string): n is IconName => n in REGISTRY;

interface Props {
  name: IconName | string;
  size?: number;
  color?: string;
  spin?: boolean;
  fixed?: boolean;
  className?: string;
  title?: string;
}

export function Icon({ name, size, color, spin, fixed, className, title }: Props) {
  const icon = REGISTRY[name as IconName] ?? REGISTRY.question;
  return (
    <FontAwesomeIcon
      icon={icon}
      spin={spin}
      fixedWidth={fixed}
      className={className}
      title={title}
      aria-hidden={title ? undefined : true}
      style={{ fontSize: size ? `${size}px` : undefined, color }}
    />
  );
}
